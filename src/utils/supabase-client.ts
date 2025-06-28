import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    db: {
      schema: "public_v2",
    },
    auth: {
      persistSession: true,
    },
  }
);