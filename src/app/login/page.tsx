"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      router.push("/dashboard");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setMessage(error ? error.message : "Đã gửi liên kết đăng nhập. Hãy kiểm tra email của bạn.");
  }

  return (
    <main className="page narrow">
      <div className="stack" style={{ maxWidth: 480, marginInline: "auto" }}>
        <p className="eyebrow">Chào bạn trở lại</p>
        <h1 style={{ fontSize: "3rem" }}>Đăng nhập</h1>
        <p className="muted">Nhận một liên kết đăng nhập an toàn qua email.</p>
        <form className="stack" onSubmit={signIn}>
          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" />
          </label>
          <button className="button" type="submit">Gửi liên kết đăng nhập</button>
        </form>
        {message && <p className="notice" role="status">{message}</p>}
        {!isSupabaseConfigured() && <p className="small muted">Demo local đang bật — form sẽ đưa bạn thẳng tới dashboard.</p>}
        <Link href="/">← Quay lại trang chủ</Link>
      </div>
    </main>
  );
}
