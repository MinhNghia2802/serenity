import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, isServerSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isServerSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") redirect("/dashboard");
  }
  return <div className="admin-layout"><aside className="admin-sidebar stack-sm"><p className="eyebrow">Điều hành</p><Link href="/admin">Tổng quan</Link><Link href="/admin/artwork-sets">Bộ tranh</Link><Link href="/admin/question-sets">Bộ câu hỏi</Link><p className="small muted">Demo local. Khi bật Supabase, route được bảo vệ theo role admin.</p></aside><main className="admin-content">{children}</main></div>;
}
