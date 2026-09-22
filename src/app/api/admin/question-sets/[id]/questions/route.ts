import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { questionSchema } from "@/lib/validations/admin";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { id } = await params;
  const { data, error } = await context.supabase.from("questions").select("*").eq("question_set_id", id).order("sort_order");
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { id } = await params;
  const input = questionSchema.parse(await request.json());
  const { count } = await context.supabase.from("questions").select("id", { count: "exact", head: true }).eq("question_set_id", id);
  const { data, error } = await context.supabase.from("questions").insert({ question_set_id: id, question_key: input.questionKey, prompt: input.prompt, input_type: input.inputType, is_required: input.isRequired, sort_order: (count ?? 0) + 1 }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}
