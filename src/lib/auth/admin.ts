import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const, supabase, user: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "forbidden" as const, supabase, user };
  return { error: null, supabase, user };
}
