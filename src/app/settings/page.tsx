"use client";

import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [reminder, setReminder] = useState(false);
  async function exportData() {
    const data = isSupabaseConfigured()
      ? JSON.stringify(await fetch("/api/export").then((response) => response.json()), null, 2)
      : localStorage.getItem("serenity-history") || "[]";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "serenity-data.json"; link.click(); URL.revokeObjectURL(url);
  }
  function clearData() {
    if (window.confirm("Xóa toàn bộ dữ liệu Serenity trên trình duyệt này?")) {
      Object.keys(localStorage).filter((key) => key.startsWith("serenity-")).forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    }
  }
  return <main className="page narrow"><div className="stack">
    <div><p className="eyebrow">Tùy chọn của bạn</p><h1 style={{ fontSize: "3.4rem" }}>Cài đặt</h1></div>
    <section className="card row space-between"><div><h3>Nhắc check-in hằng ngày</h3><p className="small muted">Phiên bản đầu lưu lựa chọn; notification sẽ nối ở giai đoạn sau.</p></div><input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} aria-label="Bật nhắc hằng ngày" /></section>
    <section className="card stack-sm"><h3>Dữ liệu của bạn</h3><p className="muted">Xuất hoặc xóa dữ liệu demo đang lưu trên trình duyệt.</p><div className="row"><button className="button button--secondary" onClick={exportData}>Xuất JSON</button><button className="button button--danger" onClick={clearData}>Xóa dữ liệu local</button></div></section>
    <section className="soft-card small"><strong>Quyền riêng tư:</strong> Serenity không dùng dữ liệu của bạn để huấn luyện hoặc cải thiện mô hình. Khi kết nối Supabase, văn bản nhạy cảm được mã hóa trước khi lưu.</section>
  </div></main>;
}
