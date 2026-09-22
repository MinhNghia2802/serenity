import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { emotionSlugs } from "@/types/domain";

const schema = z.object({ isAccurate: z.boolean(), correctedEmotion: z.enum(emotionSlugs).nullable().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const input = schema.parse(await request.json());
  const { data: owned } = await supabase.from("check_ins").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!owned) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { error } = await supabase.from("emotion_feedback").insert({ check_in_id: id, user_id: user.id, is_accurate: input.isAccurate, corrected_emotion: input.correctedEmotion ?? null });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
