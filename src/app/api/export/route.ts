import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { decryptText } from "@/lib/security/encryption";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [{ data: checkIns }, { data: texts }, { data: analyses }, { data: feedback }] = await Promise.all([
    supabase.from("check_ins").select("*").eq("user_id", user.id),
    supabase.from("checkin_texts").select("*").eq("user_id", user.id),
    supabase.from("emotion_analyses").select("*").eq("user_id", user.id),
    supabase.from("emotion_feedback").select("id,check_in_id,is_accurate,corrected_emotion,created_at").eq("user_id", user.id),
  ]);
  const decryptedTexts = (texts ?? []).map((item) => ({ check_in_id: item.check_in_id, art_description: decryptText(item.art_description_encrypted), additional_sharing: item.additional_sharing_encrypted ? decryptText(item.additional_sharing_encrypted) : "" }));
  return NextResponse.json({ exportedAt: new Date().toISOString(), checkIns, texts: decryptedTexts, analyses, feedback });
}
