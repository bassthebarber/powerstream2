import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when real project URL + anon key are set (not template placeholder). */
export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseAnonKey !== "PASTE_REAL_KEY_HERE"
  );
}

const url = supabaseUrl || "https://invalid.local.supabase.co";
const key = supabaseAnonKey || "invalid-anon-key";

export const supabase = createClient(url, key);
