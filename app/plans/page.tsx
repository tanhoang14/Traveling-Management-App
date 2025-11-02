"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { supabase } from "@/lib/supbabaseClient";
import { Card } from "primereact/card";
import { useSupabaseSession } from "../components/SupabaseProvider";

export default function TripsPage() {
   const router = useRouter();
  const { session } = useSupabaseSession();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!session?.user) return;

      setLoading(true);
    const { data, error } = await supabase
        .from("trip_users")
        .select(`
          trip_id,
          trips (
            trip_id,
            location,
            trip_start_date,
            trip_duration,
            budget
          )
        `)
        .eq("user_id", session.user.id) 
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error.message);
      } else {
           // Flatten trips from relation
        const formatted = (data || [])
          .map((row) => row.trips)
          .filter(Boolean);
        setTrips(formatted);
      }
      setLoading(false);
    };

    fetchTrips();
  }, [session]);

  return (
    <main className="min-h-screen p-8 mb-4">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 " />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">🧳 My Trips</h1>

      <div className="flex flex-col items-center justify-center mt-20">
        {loading ? (
            <ProgressSpinner
                    style={{ width: "50px", height: "50px" }}
                    strokeWidth="8"
                    fill="var(--surface-ground)"
                    animationDuration=".5s"
                  />
          ) : trips.length === 0 && (
            <div>
              <p className="text-lg -400 mb-4 text-center">
                    You don’t have any trips yet.
              </p>
          </div>
       )}

      <div className="">
        {trips.map((trip,index) => (
          <Card
            key={trip.trip_id ?? `trip-${index}`}
            title={trip.location}
            subTitle={`📅 ${new Date(
                  trip.trip_start_date
                ).toLocaleDateString()}`}           
            onClick={() => router.push(`/plans/${trip.trip_id}`)}
            className="
                  px-6 py-4 rounded-lg  font-semibold
                  bg-brown-700
                  mb-2
                  cursor-pointer
                  w-full"
          >
            <p>⏱ {trip.trip_duration} days</p>
            <p>💰 Budget: ${trip.budget}</p>
          </Card>
        ))}
         <Card onClick={() => router.push("/plans/trips/create")}
              className="flex flex-col items-center justify-center cursor-pointer 
               border-2 border-dashed border-gray-500 mt-2 mb-2
               px-6 py-10 rounded-lg  font-semibold 
               hover:bg-brown-700 transition w-full"
          >
          <p>Create New Trip</p>
  </Card>
      </div>
  </div>
      <button className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full bg-neo-moss hover:bg-blue-500 shadow-lg transition-colors"
          aria-label="Add an existing trip">
          <Plus className="w-5 h-5 " />
          <span className=" font-medium">Add an existing trip</span>
      </button>
    </main>
  );
}
