"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getFirstAuthValidationError, registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const parsed = registerSchema.safeParse({ displayName, email, password, confirmPassword });
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
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setPending(false);

    if (error) {
      setMessage(error.message.includes("already registered") ? "Email này đã có tài khoản. Hãy đăng nhập." : "Không thể tạo tài khoản lúc này. Vui lòng thử lại.");
      return;
    }

    if (!data.session) {
      setMessage("Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận trước khi đăng nhập.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="page narrow">
      <div className="stack auth-panel">
        <p className="eyebrow">Bắt đầu với Serenity</p>
        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="muted">Mật khẩu được Supabase Auth quản lý và không được lưu trong database của ứng dụng.</p>
        <form className="stack" onSubmit={register}>
          <label className="field">
            <span className="label">Tên hiển thị</span>
            <input className="input" autoComplete="name" required minLength={2} maxLength={60} value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" />
          </label>
          <label className="field">
            <span className="label">Mật khẩu</span>
            <input className="input" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="password-help" />
            <span id="password-help" className="small muted">Ít nhất 8 ký tự, gồm chữ cái và chữ số.</span>
          </label>
          <label className="field">
            <span className="label">Nhập lại mật khẩu</span>
            <input className="input" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          <button className="button" type="submit" disabled={pending}>{pending ? "Đang tạo tài khoản…" : "Đăng ký"}</button>
        </form>
        {message && <p className="notice" role="alert">{message}</p>}
        <p className="small">Đã có tài khoản? <Link className="text-link" href="/login">Đăng nhập</Link></p>
        <Link href="/">← Quay lại trang chủ</Link>
      </div>
    </main>
  );
}
