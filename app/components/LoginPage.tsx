"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">🌍 Travel App Login</h1>

        <button
          onClick={() => signIn('google')}
          className="google-content-bg"
        >
          <span>🔑</span>
          <span>Login with Google</span>
        </button>
      </div>
    </main>
  );
}
