"use client";

import Link from "next/link";
import { supabase } from "../../lib/supbabaseClient";
import { useSupabaseSession } from "./SupabaseProvider";
import { useRef,useEffect } from "react";

export default function MainPage() {
  const { session } = useSupabaseSession();
  const ranOnce = useRef(false);

  // When user logs in, ensure they exist in the users table
  useEffect(() => {
    const ensureUserExists = async () => {
      if (!session?.user?.email) return;

      const email = session.user.email;

      // 1️⃣ Check if a user with this email already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = "No rows found" in PostgREST, ignore this one
        console.error("Error checking user:", fetchError.message);
        return;
      }

      if (!existingUser) {
        // 2️⃣ Insert new user if it doesn't exist
        const { error: insertError } = await supabase.from("users").insert({
          user_id: session.user.id,
          email,
          name: session.user.user_metadata.full_name,
          image_url:
            session.user.user_metadata.avatar_url ||
            session.user.user_metadata.picture,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Error creating user:", insertError.message);
        }
      }
    };

    ensureUserExists();
  }, [session?.user?.email]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 paper ">
      <h1 className="text-3xl font-bold mb-10 text-center">
        🌍 Travel App Management
      </h1>

      <div className="flex flex-col w-full max-w-xs space-y-4">
        <Link href="/plans">
          <button
            className="w-full px-6 py-3 rounded-lg text-black font-semibold paper-pink"
          >
            🧳 Plan your trip
          </button>
        </Link>

        <Link href="/financial">
          <button
            className="w-full px-6 py-3 rounded-lg text-black font-semibold paper-cyan"
          >
            💰 Financial
          </button>
        </Link>

        <Link href="/insight">
          <button
            className="w-full px-6 py-3 rounded-lg text-black font-semibold paper-light-green"
          >
            📊 Insights
          </button>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full px-6 text-white py-3 mt-4 rounded-lg  font-semibold
            bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800
            hover:from-gray-800 hover:via-gray-700 hover:to-gray-600
            shadow-lg shadow-gray-700/50 transition-all duration-500 ease-in-out hover:scale-105"
        >
          🚪 Logout
        </button>
      </div>
    </main>
  );
}
