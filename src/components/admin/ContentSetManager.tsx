"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type ContentSet = { id: string; name: string; description: string; status: "draft" | "published" | "archived"; version: number };

export default function ContentSetManager({ type }: { type: "artwork" | "question" }) {
  const storageKey = `serenity-admin-${type}-sets`;
  const label = type === "artwork" ? "bộ tranh" : "bộ câu hỏi";
  const [items, setItems] = useState<ContentSet[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const basePath = type === "artwork" ? "/api/admin/artwork-sets" : "/api/admin/question-sets";
  const pagePath = type === "artwork" ? "/admin/artwork-sets" : "/admin/question-sets";
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    fetch(basePath).then((response) => response.json()).then((data) => { if (active && Array.isArray(data)) setItems(data); }).catch(() => undefined);
    return () => { active = false; };
  }, [basePath]);
  function persist(next: ContentSet[]) { setItems(next); localStorage.setItem(storageKey, JSON.stringify(next)); }
  async function create(event: React.FormEvent) { event.preventDefault(); if (!name.trim()) return; setError(""); if (isSupabaseConfigured()) { const response = await fetch(basePath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) }); const data = await response.json(); if (!response.ok) { setError(data.error); return; } setItems([data, ...items]); } else { persist([{ id: crypto.randomUUID(), name, description, status: "draft", version: 1 }, ...items]); } setName(""); setDescription(""); }
  async function setStatus(id: string, status: ContentSet["status"]) { setError(""); if (isSupabaseConfigured()) { const response = await fetch(`${basePath}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); const data = await response.json(); if (!response.ok) { setError(data.error); return; } setItems(items.map((item) => item.id === id ? data : item)); } else persist(items.map((item) => item.id === id ? { ...item, status } : item)); }
  return <div className="stack"><div><p className="eyebrow">Quản lý nội dung</p><h1 style={{ fontSize: "3rem" }}>Các {label}</h1></div><form className="card stack-sm" onSubmit={create}><h3>Tạo {label} mới</h3><label className="field"><span className="label">Tên</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} required /></label><label className="field"><span className="label">Mô tả</span><textarea className="textarea" value={description} onChange={(event) => setDescription(event.target.value)} /></label><button className="button" type="submit">Lưu bản nháp</button></form>{error && <p className="danger-notice">{error}</p>}{items.length === 0 ? <div className="soft-card">Chưa có dữ liệu. Hãy tạo {label} đầu tiên.</div> : <div className="card"><table className="table"><thead><tr><th>Tên</th><th>Phiên bản</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><Link href={`${pagePath}/${item.id}`}><strong>{item.name}</strong></Link><br/><span className="small muted">{item.description}</span></td><td>v{item.version}</td><td><span className="status">{item.status}</span></td><td><div className="row"><Link className="button button--secondary" href={`${pagePath}/${item.id}`}>Mở</Link><button className="button button--secondary" onClick={() => setStatus(item.id, "published")}>Publish</button><button className="button button--ghost" onClick={() => setStatus(item.id, "archived")}>Archive</button></div></td></tr>)}</tbody></table></div>}</div>;
}
