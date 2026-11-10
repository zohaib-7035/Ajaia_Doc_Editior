import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the secret key. RLS is enabled with no policies,
// so the public anon key can read nothing; all access goes through our API.
let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
