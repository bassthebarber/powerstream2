// Service-role Supabase client (server only). Never expose key to frontend.
import { createClient } from "@supabase/supabase-js";
import env from "../config/env.js";
import { logger } from "../config/logger.js";

let client = null;

export function getSupabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    logger.info("[SupabaseAdmin] Client initialized");
  }
  return client;
}

export function isSupabaseLiveEngineEnabled() {
  return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
