"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getFirstAuthValidationError, loginSchema } from "@/lib/validations/auth";

function safeNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setMessage(getFirstAuthValidationError(parsed.error));
      return;
    }
    if (!isSupabaseConfigured()) {
      router.push("/dashboard");
      return;
    }
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);
    if (error) {
      setMessage(error.message === "Invalid login credentials" ? "Email hoặc mật khẩu chưa đúng." : "Không thể đăng nhập lúc này. Vui lòng thử lại.");
      return;
    }
    router.replace(safeNextPath());
    router.refresh();
  }

  return (
    <main className="page narrow">
      <div className="stack auth-panel">
        <p className="eyebrow">Chào bạn trở lại</p>
        <h1 className="auth-title">Đăng nhập</h1>
        <p className="muted">Dùng email và mật khẩu để tiếp tục hành trình check-in của bạn.</p>
        <form className="stack" onSubmit={signIn}>
          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" />
          </label>
          <label className="field">
            <span className="label">Mật khẩu</span>
            <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="button" type="submit" disabled={pending}>{pending ? "Đang đăng nhập…" : "Đăng nhập"}</button>
        </form>
        {message && <p className="notice" role="alert">{message}</p>}
        <p className="small">Chưa có tài khoản? <Link className="text-link" href="/register">Đăng ký</Link></p>
        {!isSupabaseConfigured() && <p className="small muted">Demo local đang bật — form sẽ đưa bạn thẳng tới dashboard.</p>}
        <Link href="/">← Quay lại trang chủ</Link>
      </div>
    </main>
  );
}
