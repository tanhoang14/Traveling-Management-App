"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TripsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">🧳 My Trips</h1>

      <div className="flex flex-col items-center justify-center mt-20">
        <p className="text-lg text-gray-400 mb-4">You don’t have any trips yet.</p>
        <button
          onClick={() => router.push("/plans/trips")}
          className="add-trips-button"
        >
          ➕ Add Your Trip
        </button>
      </div>
    </main>
  );
}
