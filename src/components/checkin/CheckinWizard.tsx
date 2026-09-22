"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { emotions, negativeEmotionSlugs } from "@/lib/emotion/taxonomy";
import { selectDemoArtwork } from "@/lib/content/demo";
import type { AnalysisResult, CheckInDraft, EmotionSlug } from "@/types/domain";

const causes = [
  ["work", "Công việc"], ["study", "Học tập"], ["family", "Gia đình"],
  ["relationship", "Tình cảm"], ["finance", "Tài chính"], ["health", "Sức khỏe"],
  ["other", "Khác"], ["prefer_not_to_say", "Không muốn nói"],
];

const initialDraft: CheckInDraft = {
  primaryEmotion: null,
  energyScore: null,
  stressScore: null,
  causeCategory: null,
  artworkId: "",
  artworkUrl: "",
  artDescription: "",
  additionalSharing: "",
};

export default function CheckinWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const artwork = useMemo(
    () => draft.primaryEmotion ? selectDemoArtwork(draft.primaryEmotion) : null,
    [draft.primaryEmotion],
  );
  const needsCause = Boolean(
    (draft.primaryEmotion && negativeEmotionSlugs.has(draft.primaryEmotion)) ||
    (draft.stressScore && draft.stressScore >= 3),
  );

  function chooseEmotion(primaryEmotion: EmotionSlug) {
    const selectedArtwork = selectDemoArtwork(primaryEmotion);
    setDraft((current) => ({
      ...current,
      primaryEmotion,
      artworkId: selectedArtwork.id,
      artworkUrl: selectedArtwork.url,
    }));
  }

  function canContinue() {
    if (step === 1) return Boolean(draft.primaryEmotion);
    if (step === 3) return Boolean(draft.stressScore);
    if (step === 4) return draft.artDescription.trim().length > 0;
    return true;
  }

  async function submit() {
    if (!draft.primaryEmotion || !draft.stressScore || !artwork) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, idempotencyKey: crypto.randomUUID() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Không thể phân tích lúc này.");
      const result = payload as AnalysisResult;
      localStorage.setItem(`serenity-result:${result.checkInId}`, JSON.stringify(result));
      const history = JSON.parse(localStorage.getItem("serenity-history") || "[]");
      localStorage.setItem("serenity-history", JSON.stringify([{ ...result, draft }, ...history].slice(0, 30)));
      router.push(`/check-in/result/${result.checkInId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Có lỗi xảy ra. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (!canContinue()) {
      setError("Hãy hoàn thành câu hỏi này trước khi tiếp tục.");
      return;
    }
    setError("");
    setStep((current) => Math.min(5, current + 1));
  }

  return (
    <div className="stack">
      <div className="row space-between small">
        <span>Bước {step} / 5</span><span className="muted">Khoảng 3–5 phút</span>
      </div>
      <div className="progress" aria-label={`Tiến độ ${step} trên 5`}><span style={{ width: `${step * 20}%` }} /></div>

      {step === 1 && <section className="stack">
        <div className="stack-sm"><p className="eyebrow">Bắt đầu từ hiện tại</p><h2>Ngay lúc này, cảm xúc nào nổi bật nhất ở bạn?</h2><p className="muted">Không có lựa chọn đúng hay sai. Hãy chọn điều gần nhất.</p></div>
        <div className="emotion-grid">
          {emotions.map((emotion) => <button key={emotion.slug} className="choice" aria-pressed={draft.primaryEmotion === emotion.slug} onClick={() => chooseEmotion(emotion.slug)}>
            <strong><span className="dot" style={{ background: emotion.tone }} />{emotion.label}</strong><br /><span className="small muted">{emotion.hint}</span>
          </button>)}
        </div>
      </section>}

      {step === 2 && <section className="stack">
        <div className="stack-sm"><p className="eyebrow">Năng lượng</p><h2>Mức năng lượng của bạn hiện tại như thế nào?</h2><p className="muted">Bạn có thể bỏ qua nếu chưa chắc.</p></div>
        <Scale value={draft.energyScore} onChange={(energyScore) => setDraft({ ...draft, energyScore })} low="Rất thấp" high="Rất cao" />
        <button className="button button--ghost" onClick={() => { setDraft({ ...draft, energyScore: null }); next(); }}>Bỏ qua câu này</button>
      </section>}

      {step === 3 && <section className="stack">
        <div className="stack-sm"><p className="eyebrow">Cường độ</p><h2>Bạn đang thấy căng thẳng ở mức nào?</h2></div>
        <Scale value={draft.stressScore} onChange={(stressScore) => setDraft({ ...draft, stressScore })} low="Không đáng kể" high="Rất cao" />
        {needsCause && <div className="stack-sm"><p className="label">Điều gì đang ảnh hưởng nhiều nhất? <span className="muted">(không bắt buộc)</span></p><div className="chip-list">{causes.map(([value,label]) => <button key={value} className="chip" aria-pressed={draft.causeCategory === value} onClick={() => setDraft({ ...draft, causeCategory: value })}>{label}</button>)}</div></div>}
      </section>}

      {step === 4 && artwork && <section className="stack">
        <div className="stack-sm"><p className="eyebrow">Nhìn và cảm nhận</p><h2>Bức tranh này gợi cho bạn điều gì?</h2></div>
        <div className="artwork"><Image src={artwork.url} alt={artwork.alt} fill sizes="(max-width: 760px) 100vw, 720px" priority /></div>
        <label className="field"><span className="label">Bạn thấy gì? Điều gì nổi bật? Bức tranh khiến bạn cảm thấy thế nào?</span><textarea className="textarea" maxLength={5000} value={draft.artDescription} onChange={(e) => setDraft({ ...draft, artDescription: e.target.value })} placeholder="Hãy viết theo cách tự nhiên nhất của bạn…" /></label>
      </section>}

      {step === 5 && <section className="stack">
        <div className="stack-sm"><p className="eyebrow">Trước khi kết thúc</p><h2>Điều gì đang khiến bạn suy nghĩ nhiều nhất lúc này?</h2><p className="muted">Bạn có thể bỏ qua nếu chưa muốn chia sẻ.</p></div>
        <textarea className="textarea" maxLength={5000} value={draft.additionalSharing} onChange={(e) => setDraft({ ...draft, additionalSharing: e.target.value })} placeholder="Viết thêm nếu bạn muốn…" />
        <div className="notice small">Nội dung sẽ được dùng để đưa ra gợi ý wellbeing, không phải chẩn đoán.</div>
      </section>}

      {error && <p className="danger-notice" role="alert">{error}</p>}
      <div className="row space-between">
        <button className="button button--secondary" disabled={step === 1 || loading} onClick={() => setStep((current) => current - 1)}><ChevronLeft size={17} /> Quay lại</button>
        {step < 5 ? <button className="button" disabled={!canContinue()} onClick={next}>Tiếp tục <ChevronRight size={17} /></button> : <button className="button" disabled={loading} onClick={submit}>{loading ? <><LoaderCircle size={17} /> Đang tổng hợp…</> : "Xem kết quả"}</button>}
      </div>
    </div>
  );
}

function Scale({ value, onChange, low, high }: { value: number | null; onChange: (value: number) => void; low: string; high: string }) {
  return <div className="stack-sm"><div className="scale">{[1,2,3,4,5].map((number) => <button key={number} aria-label={`${number} trên 5`} aria-pressed={value === number} onClick={() => onChange(number)}>{number}</button>)}</div><div className="row space-between small muted"><span>{low}</span><span>{high}</span></div></div>;
}
