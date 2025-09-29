"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function MainPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-animated text-white">
      <h1 className="text-3xl font-bold mb-10 text-center">
        🌍 Travel App Management
      </h1>

      <div className="flex flex-col w-full max-w-xs space-y-4">
        <Link href="/plans">
          <button className="w-full px-6 py-3 rounded-lg text-white font-semibold
            bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600
            hover:from-purple-600 hover:via-blue-600 hover:to-cyan-500
            shadow-lg shadow-cyan-500/50 transition-all duration-500 ease-in-out hover:scale-105">
            🧳 Plan your trip
          </button>
        </Link>

        <Link href="/financial">
          <button className="w-full px-6 py-3 rounded-lg text-white font-semibold
            bg-gradient-to-r from-green-400 via-emerald-600 to-teal-500
            hover:from-teal-500 hover:via-emerald-600 hover:to-green-400
            shadow-lg shadow-emerald-500/50 transition-all duration-500 ease-in-out hover:scale-105">
            💰 Financial
          </button>
        </Link>

        <Link href="/insight">
          <button className="w-full px-6 py-3 rounded-lg text-white font-semibold
            bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600
            hover:from-indigo-600 hover:via-purple-600 hover:to-pink-500
            shadow-lg shadow-pink-500/50 transition-all duration-500 ease-in-out hover:scale-105">
            📊 Insights
          </button>
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full px-6 py-3 mt-4 rounded-lg text-white font-semibold
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
