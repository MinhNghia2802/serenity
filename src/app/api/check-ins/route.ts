import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("check_ins").select("id,created_at,primary_emotion,stress_score,energy_score,status,emotion_analyses(final_emotion,intensity,reason_short,action_suggestion,safety_level)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}
