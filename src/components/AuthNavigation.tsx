import Link from "next/link";
import { createServerSupabaseClient, isServerSupabaseConfigured } from "@/lib/supabase/server";

export default async function AuthNavigation() {
  if (!isServerSupabaseConfigured() || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return (
      <nav className="nav" aria-label="Điều hướng chính">
        <Link href="/login">Đăng nhập</Link>
        <Link href="/register">Đăng ký</Link>
        <Link className="button" href="/check-in">Check-in ngay</Link>
      </nav>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <nav className="nav" aria-label="Điều hướng chính">
        <Link href="/login">Đăng nhập</Link>
        <Link href="/register">Đăng ký</Link>
        <Link className="button" href="/login?next=/check-in">Check-in ngay</Link>
      </nav>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  return (
    <nav className="nav" aria-label="Điều hướng chính">
      <Link href="/dashboard">Tổng quan</Link>
      <Link href="/history">Lịch sử</Link>
      <Link href="/settings">Cài đặt</Link>
      {profile?.role === "admin" && <Link href="/admin">Quản trị</Link>}
      <form action="/auth/logout" method="post">
        <button className="nav-button" type="submit">Đăng xuất</button>
      </form>
      <Link className="button" href="/check-in">Check-in ngay</Link>
    </nav>
  );
}
