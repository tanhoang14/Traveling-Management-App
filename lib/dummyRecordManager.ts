import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client with service role key for admin operations
 * This allows us to create/delete dummy records with elevated privileges
 */
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};

/**
 * Add a dummy record to keep the database active
 * Creates a record in a dedicated dummy_records table
 */
export const addDummyRecord = async () => {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("dummy_records")
      .insert([
        {
          id: `dummy_${Date.now()}`,
          created_at: new Date().toISOString(),
          metadata: "Auto-generated record to keep database active",
          is_dummy: true,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding dummy record:", error);
      return { success: false, error: error.message };
    }

    console.log("Dummy record added successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Exception adding dummy record:", err);
    return { success: false, error: String(err) };
  }
};

/**
 * Clean up old dummy records (older than specified days)
 * This prevents the dummy_records table from growing infinitely
 */
export const cleanupDummyRecords = async (daysOld: number = 7) => {
  try {
    const supabase = getAdminClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error, count } = await supabase
      .from("dummy_records")
      .delete()
      .lt("created_at", cutoffDate.toISOString())
      .eq("is_dummy", true)
      .select();

    if (error) {
      console.error("Error cleaning up dummy records:", error);
      return { success: false, error: error.message };
    }

    console.log(`Cleaned up ${count || 0} old dummy records`);
    return { success: true, deletedCount: count };
  } catch (err) {
    console.error("Exception cleaning up dummy records:", err);
    return { success: false, error: String(err) };
  }
};

/**
 * Perform a read operation to keep database active without modifying data
 * This is a lighter alternative if you don't want to create/delete records
 */
export const pingDatabase = async () => {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("dummy_records")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Error pinging database:", error);
      return { success: false, error: error.message };
    }

    console.log("Database ping successful");
    return { success: true };
  } catch (err) {
    console.error("Exception pinging database:", err);
    return { success: false, error: String(err) };
  }
};
