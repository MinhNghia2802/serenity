import { NextResponse } from "next/server";
import { createServerSupabaseClient, isServerSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (isServerSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
