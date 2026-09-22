import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { setStatusSchema } from "@/lib/validations/admin";

const requiredKeys = ["primary_emotion", "energy_score", "stress_score", "art_description", "additional_sharing"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (context.error || !context.user) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { id } = await params;
  const input = setStatusSchema.parse(await request.json());
  if (input.status === "published") {
    const { data } = await context.supabase.from("questions").select("question_key").eq("question_set_id", id).eq("is_active", true);
    const keys = new Set((data ?? []).map((item) => item.question_key));
    if (requiredKeys.some((key) => !keys.has(key))) return NextResponse.json({ error: "Bộ câu hỏi chưa đủ các câu hỏi cốt lõi." }, { status: 422 });
  }
  const { data, error } = await context.supabase.from("question_sets").update({ status: input.status, published_at: input.status === "published" ? new Date().toISOString() : null, updated_by: context.user.id }).eq("id", id).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}
