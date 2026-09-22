"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { emotions } from "@/lib/emotion/taxonomy";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Row = Record<string, unknown> & { id: string };

export default function SetItemEditor({ type }: { type: "artwork" | "question" }) {
  const { id } = useParams<{ id: string }>();
  const basePath = type === "artwork" ? `/api/admin/artwork-sets/${id}/artworks` : `/api/admin/question-sets/${id}/questions`;
  const storageKey = `serenity-admin-${type}-items:${id}`;
  const [items, setItems] = useState<Row[]>(() => typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem(storageKey) || "[]"));
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string | boolean>>(
    type === "artwork"
      ? { imageUrl: "", altText: "", license: "Unsplash License", emotionTag: "calm" }
      : { questionKey: "", prompt: "", inputType: "textarea", isRequired: false },
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    fetch(basePath).then((response) => response.json()).then((data) => { if (active && Array.isArray(data)) setItems(data); }).catch(() => undefined);
    return () => { active = false; };
  }, [basePath]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const body = type === "artwork"
      ? { imageUrl: form.imageUrl, altText: form.altText, license: form.license, emotionTags: [form.emotionTag] }
      : { questionKey: form.questionKey, prompt: form.prompt, inputType: form.inputType, isRequired: form.isRequired };
    if (isSupabaseConfigured()) {
      const response = await fetch(basePath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Không thể lưu nội dung."); return; }
      setItems([...items, data]);
    } else {
      const next = [...items, { id: crypto.randomUUID(), ...body }];
      setItems(next); localStorage.setItem(storageKey, JSON.stringify(next));
    }
  }

  return <div className="stack"><div><p className="eyebrow">Trình soạn nội dung</p><h1 style={{ fontSize: "3rem" }}>{type === "artwork" ? "Tranh trong bộ" : "Câu hỏi trong bộ"}</h1></div><form className="card stack" onSubmit={submit}>{type === "artwork" ? <>
    <label className="field"><span className="label">URL ảnh</span><input className="input" type="url" required value={String(form.imageUrl)} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
    <label className="field"><span className="label">Alt text trung tính</span><input className="input" required value={String(form.altText)} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></label>
    <label className="field"><span className="label">License</span><input className="input" required value={String(form.license)} onChange={(e) => setForm({ ...form, license: e.target.value })} /></label>
    <label className="field"><span className="label">Tag cảm xúc</span><select className="select" value={String(form.emotionTag)} onChange={(e) => setForm({ ...form, emotionTag: e.target.value })}>{emotions.map((emotion) => <option key={emotion.slug} value={emotion.slug}>{emotion.label}</option>)}</select></label>
  </> : <>
    <label className="field"><span className="label">Question key</span><input className="input" required pattern="[a-z][a-z0-9_]*" value={String(form.questionKey)} onChange={(e) => setForm({ ...form, questionKey: e.target.value })} /></label>
    <label className="field"><span className="label">Nội dung câu hỏi</span><textarea className="textarea" required value={String(form.prompt)} onChange={(e) => setForm({ ...form, prompt: e.target.value })} /></label>
    <label className="field"><span className="label">Kiểu nhập</span><select className="select" value={String(form.inputType)} onChange={(e) => setForm({ ...form, inputType: e.target.value })}><option value="single_select">Một lựa chọn</option><option value="scale">Thang điểm</option><option value="textarea">Văn bản</option></select></label>
    <label className="row"><input type="checkbox" checked={Boolean(form.isRequired)} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} /> Bắt buộc trả lời</label>
  </>}<button className="button" type="submit">Thêm vào bộ</button></form>{error && <p className="danger-notice">{error}</p>}<div className="card"><table className="table"><thead><tr><th>{type === "artwork" ? "Nội dung tranh" : "Câu hỏi"}</th><th>Loại / Tag</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{String(item.alt_text ?? item.altText ?? item.prompt ?? "")}</td><td>{String(item.input_type ?? item.inputType ?? item.emotionTag ?? (Array.isArray(item.emotion_tags) ? item.emotion_tags.join(", ") : ""))}</td></tr>)}</tbody></table>{items.length === 0 && <p className="muted">Chưa có nội dung trong bộ này.</p>}</div></div>;
}
