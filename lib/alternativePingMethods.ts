/**
 * Lightweight Alternative: Database Ping Only
 *
 * Use this if you prefer NOT to create/delete dummy records
 * This just performs read operations to keep the database connection active
 *
 * Instructions:
 * 1. Uncomment this and comment out the addDummyRecord approach in app/api/database-ping/route.ts
 * 2. This requires fewer permissions and produces zero data overhead
 */

import { createClient } from "@supabase/supabase-js";

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};

/**
 * Lightweight ping - performs a read-only query
 * Doesn't create any records, just touches the database
 */
export const lightweightPing = async () => {
  try {
    const supabase = getAdminClient();

    // Simple read operation on any existing table
    // This example uses the auth.users table (exists in all Supabase projects)
    const { data, error, count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Error in lightweight ping:", error);
      return { success: false, error: error.message };
    }

    console.log("Lightweight database ping successful");
    return { success: true };
  } catch (err) {
    console.error("Exception in lightweight ping:", err);
    return { success: false, error: String(err) };
  }
};

/**
 * Alternative: Ping using RPC function (zero record overhead)
 * This is the most efficient method
 */
export const rpcPing = async () => {
  try {
    const supabase = getAdminClient();

    // Call a simple RPC function (requires setup in Supabase)
    const { data, error } = await supabase.rpc("health_check", {});

    if (error) {
      console.error("Error in RPC ping:", error);
      return { success: false, error: error.message };
    }

    console.log("RPC database ping successful");
    return { success: true };
  } catch (err) {
    console.error("Exception in RPC ping:", err);
    return { success: false, error: String(err) };
  }
};
