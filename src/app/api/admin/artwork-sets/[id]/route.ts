import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { setStatusSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (context.error || !context.user) return NextResponse.json({ error: context.error }, { status: context.error === "unauthorized" ? 401 : 403 });
  const { id } = await params;
  const input = setStatusSchema.parse(await request.json());
  if (input.status === "published") {
    const { count } = await context.supabase.from("artworks").select("id", { count: "exact", head: true }).eq("artwork_set_id", id).eq("is_active", true);
    if (!count) return NextResponse.json({ error: "Bộ tranh cần ít nhất một tranh hợp lệ trước khi publish." }, { status: 422 });
  }
  const { data, error } = await context.supabase.from("artwork_sets").update({ status: input.status, published_at: input.status === "published" ? new Date().toISOString() : null, updated_by: context.user.id }).eq("id", id).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}
