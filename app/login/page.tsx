"use client";

import { supabase } from "../../lib/supbabaseClient";

export default function LoginPage() {
  const signInWithGoogle = async () => {
  // 1️⃣ Trigger OAuth login
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: process.env.NEXTAUTH_URL, // or your app URL
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) {
    console.error("Google login error:", error.message);
    return;
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">🌍 Travel App Login</h1>

        <button
          onClick={signInWithGoogle}
          className="google-content-bg w-full flex items-center justify-center gap-2 p-3 rounded-lg hover:opacity-90"
        >
          <span>🔑</span>
          <span>Login with Google</span>
        </button>
      </div>
    </main>
  );
}
