"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { emotionLabels } from "@/lib/emotion/taxonomy";
import type { AnalysisResult, CheckInDraft } from "@/types/domain";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type HistoryItem = AnalysisResult & { draft?: CheckInDraft };

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("serenity-history") || "[]");
  });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    fetch("/api/check-ins").then((response) => response.json()).then((rows) => {
      if (!active || !Array.isArray(rows)) return;
      const mapped = rows.map((row) => {
        const analysis = Array.isArray(row.emotion_analyses) ? row.emotion_analyses[0] : row.emotion_analyses;
        return { checkInId: row.id, createdAt: row.created_at, status: row.status === "safety" ? "safety" : "completed", finalEmotion: analysis?.final_emotion ?? row.primary_emotion, intensity: analysis?.intensity ?? row.stress_score, reasonShort: analysis?.reason_short ?? "", actionSuggestion: analysis?.action_suggestion ?? "", disclaimer: "Đây là gợi ý tham khảo, không phải chẩn đoán.", safetyLevel: analysis?.safety_level ?? "normal", recommendations: [] } as HistoryItem;
      });
      setItems(mapped);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  async function remove(id: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/check-ins/${id}`, { method: "DELETE" });
      if (!response.ok) return;
    }
    const next = items.filter((item) => item.checkInId !== id);
    setItems(next);
    localStorage.setItem("serenity-history", JSON.stringify(next));
    localStorage.removeItem(`serenity-result:${id}`);
  }
  return <main className="page container"><div className="stack">
    <div className="row space-between"><div><p className="eyebrow">Lịch sử cá nhân</p><h1 style={{ fontSize: "3.4rem" }}>Những lần bạn dừng lại</h1></div><Link className="button" href="/check-in">Check-in mới</Link></div>
    {items.length === 0 ? <div className="soft-card stack-sm"><h3>Chưa có phiên check-in</h3><p className="muted">Phiên đầu tiên sẽ xuất hiện ở đây sau khi bạn hoàn tất.</p></div> : items.map((item) => <article className="card row space-between" key={item.checkInId}><div><p className="small muted">{new Date(item.createdAt).toLocaleString("vi-VN")}</p><h3>{emotionLabels[item.finalEmotion]} · {item.intensity}/5</h3><p className="muted">{item.reasonShort}</p></div><div className="row"><Link className="button button--secondary" href={`/check-in/result/${item.checkInId}`}>Xem lại</Link><button className="button button--ghost" onClick={() => remove(item.checkInId)}>Xóa</button></div></article>)}
  </div></main>;
}
