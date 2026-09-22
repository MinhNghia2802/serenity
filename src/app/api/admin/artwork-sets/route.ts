import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { contentSetSchema } from "@/lib/validations/admin";

export async function GET() {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { data, error } = await context.supabase.from("artwork_sets").select("*").order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  const context = await getAdminContext();
  if (context.error || !context.user) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const input = contentSetSchema.parse(await request.json());
  const { data, error } = await context.supabase.from("artwork_sets").insert({ name: input.name, description: input.description, updated_by: context.user.id }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}
