"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { supabase } from "@/lib/supbabaseClient";
import { useSupabaseSession } from "@/app/components/SupabaseProvider";
import { Trip } from "@/app/types/types";

export default function TraveledTripsPage() {
  const router = useRouter();
  const { session } = useSupabaseSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraveledTrips = async () => {
      if (!session?.user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("trip_users")
        .select(`
          trip_id,
          trips (
            trip_id,
            location,
            image_url,
            trip_start_date,
            trip_end_date,
            trip_duration,
            budget
          )
        `)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching trips:", error.message);
      } else {
        const now = new Date();
        const pastTrips = (data || [])
          .map((row) => row.trips as any)
          .filter((trip: any) => trip && new Date(trip.trip_end_date) < now);

        setTrips(pastTrips);
      }

      setLoading(false);
    };

    fetchTraveledTrips();
  }, [session]);

  return (
    <main className="min-h-screen px-4 sm:px-6 pb-24">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6 mt-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold ml-4 text-center flex-1">
          Traveled Trips
        </h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="8" />
        </div>
      ) : trips.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">
          You haven’t completed any trips yet.
        </p>
      ) : (
        <section className="mt-6 w-full max-w-6xl mx-auto">
          {/* Responsive layout: vertical on mobile, horizontal scroll on desktop */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start overflow-x-auto sm:overflow-visible pb-2 snap-x snap-mandatory">
            {trips.map((trip) => (
              <div
                key={trip.trip_id}
                onClick={() => router.push(`/plans/${trip.trip_id}`)}
                className="snap-start bg-brown-700 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0 w-full sm:w-[320px] md:w-[360px]"
              >
                {/* Image */}
                <div className="w-full h-44 sm:h-48">
                  <img
                    src={trip.image_url}
                    alt={trip.location}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).src =
                        "https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg")
                    }
                  />
                </div>

                {/* Trip Info */}
                <div className="p-4 text-black bg-brown-700 text-black">
                  <h3 className="text-lg font-bold mb-1 truncate">{trip.location}</h3>
                  <p className="text-sm mb-1">
                    📅 {new Date(trip.trip_start_date).toLocaleDateString()} -{" "}
                    {new Date(trip.trip_end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm mb-1">⏱ {trip.trip_duration} days</p>
                  <p className="text-sm">
                    💰 Budget: <span className="text-green-800 font-medium">${trip.budget}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
