import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { artworkSchema } from "@/lib/validations/admin";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { id } = await params;
  const { data, error } = await context.supabase.from("artworks").select("*").eq("artwork_set_id", id).order("sort_order");
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { id } = await params;
  const input = artworkSchema.parse(await request.json());
  const { data, error } = await context.supabase.from("artworks").insert({ artwork_set_id: id, image_url: input.imageUrl, alt_text: input.altText, license: input.license, emotion_tags: input.emotionTags }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}
