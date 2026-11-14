import { createClient } from "@supabase/supabase-js";

// Server only. Never import this from a "use client" file.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const BUCKET = process.env.SUPABASE_BUCKET ?? "digital-products";