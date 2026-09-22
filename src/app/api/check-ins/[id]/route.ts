import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabase.from("check_ins").delete().eq("id", id).eq("user_id", user.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : new NextResponse(null, { status: 204 });
}
