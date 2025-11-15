"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brown-800 text-black px-6">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Oops! Page not found
      </h2>
      <p className="text-center text-black mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <button
        onClick={() => router.back()}
        className="px-6 py-3 rounded-lg bg-neo-moss hover:bg-green-600 transition-colors font-semibold shadow-lg"
      >
        ← Go Back
      </button>
    </main>
  );
}
