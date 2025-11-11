"use client";

import { supabase } from "../../lib/supbabaseClient";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    // 1️⃣ Trigger OAuth login
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXTAUTH_URL,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      return;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center  ">
      <div className="bg-brown-700 p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">🌍 Travel App Login</h1>

        <div className="flex items-center justify-center">
          <button
            onClick={signInWithGoogle}
            className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md px-6 py-2 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <span className="text-black">Continue with Google</span>
          </button>
        </div>
      </div>
    </main>
  );
}
