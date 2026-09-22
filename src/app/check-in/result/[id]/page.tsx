"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, HeartHandshake, Music2, Podcast, Wind } from "lucide-react";
import { emotionLabels } from "@/lib/emotion/taxonomy";
import type { AnalysisResult } from "@/types/domain";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const icons = { music: Music2, podcast: Podcast, exercise: Wind };

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [result] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`serenity-result:${id}`);
    return stored ? JSON.parse(stored) : null;
  });
  const [feedback, setFeedback] = useState<string>("");

  if (!result) return <main className="page narrow"><div className="card">Đang tải kết quả…</div></main>;
  const resultId = result.checkInId;

  if (result.status === "safety") {
    return <main className="page narrow"><div className="stack danger-notice">
      <HeartHandshake size={36} />
      <h1 style={{ fontSize: "2.4rem" }}>Bạn không cần phải đối diện với điều này một mình.</h1>
      <p>{result.reasonShort}</p>
      <p>Nếu bạn có thể gặp nguy hiểm ngay lúc này, hãy gọi số khẩn cấp tại nơi bạn sống hoặc đến cơ sở y tế gần nhất.</p>
      <div className="row"><a className="button button--danger" href="tel:115">Gọi hỗ trợ khẩn cấp</a><Link className="button button--secondary" href="/dashboard">Về trang chủ</Link></div>
      <p className="small">Serenity không phải dịch vụ khẩn cấp. Thông tin này không thay thế hỗ trợ chuyên môn.</p>
    </div></main>;
  }

  async function sendFeedback(isAccurate: boolean) {
    if (isSupabaseConfigured()) {
      await fetch(`/api/check-ins/${resultId}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAccurate }) });
    }
    setFeedback(isAccurate ? "Cảm ơn bạn đã xác nhận." : "Cảm ơn bạn. Bạn luôn là người hiểu cảm xúc của mình rõ nhất.");
  }

  return <main className="page narrow"><div className="stack" style={{ gap: 30 }}>
    <div className="stack-sm"><p className="eyebrow">Check-in đã hoàn tất</p><h1 style={{ fontSize: "clamp(2.6rem, 8vw, 4.8rem)" }}>{emotionLabels[result.finalEmotion]}</h1><p className="lead">Cường độ {result.intensity}/5</p></div>
    <div className="soft-card stack-sm"><h3>Điều Serenity nhận thấy</h3><p>{result.reasonShort}</p><p className="small muted">{result.disclaimer}</p></div>
    <div className="card stack-sm"><p className="eyebrow">Một bước nhỏ lúc này</p><h3>{result.actionSuggestion}</h3></div>
    <section className="stack"><h2 style={{ fontSize: "2rem" }}>Dành cho bạn lúc này</h2><div className="grid-3">{result.recommendations.map((item) => { const Icon = icons[item.type]; return <a className="card stack-sm" key={item.id} href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><Icon size={23} /><strong>{item.title}</strong><span className="small muted">{item.description}</span><span className="small">{item.provider} <ExternalLink size={12} style={{ display: "inline" }} /></span></a>; })}</div></section>
    <section className="card stack-sm"><h3>Nhận định này có gần với cảm nhận của bạn không?</h3><div className="row"><button className="button button--secondary" onClick={() => sendFeedback(true)}>Có</button><button className="button button--secondary" onClick={() => sendFeedback(false)}>Chưa đúng</button><Link className="button button--ghost" href="/check-in">Check-in lại</Link></div>{feedback && <p className="notice" role="status">{feedback}</p>}</section>
    <div className="row"><Link className="button" href="/dashboard">Về tổng quan</Link><Link className="button button--secondary" href="/history">Xem lịch sử</Link></div>
  </div></main>;
}
