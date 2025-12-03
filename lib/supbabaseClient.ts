import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ Enable session persistence
    autoRefreshToken: true, // ✅ Auto-refresh tokens
    detectSessionInUrl: true, // ✅ Detect session in URL for OAuth
  },
});
