"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { supabase } from "@/lib/supbabaseClient";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useSupabaseSession } from "../components/SupabaseProvider";

export default function TripsPage() {
   const router = useRouter();
  const { session } = useSupabaseSession();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinVisible, setJoinVisible] = useState(false);
  const [tripCode, setTripCode] = useState("");
  const toast = useRef<Toast>(null);

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

  const handleJoinTrip = async () => {
    if (!tripCode || !session?.user) {
      toast.current?.show({ severity: "warn", summary: "Enter a valid code" });
      return;
    }

    // 1️⃣ Find trip by code
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("trip_id")
      .eq("trip_code", tripCode.trim())
      .single();

    if (tripError || !tripData) {
      toast.current?.show({ severity: "error", summary: "Trip not found" });
      return;
    }

    const tripId = tripData.trip_id;

    // 2️⃣ Check if user is already part of trip
    const { data: existing, error: checkError } = await supabase
      .from("trip_users")
      .select("trip_user_id")
      .eq("trip_id", tripId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (checkError) {
      alert("Error checking membership");
      return;
    }

    if (existing) {
      alert("You already in this trip");
      return;
    }

    // 3️⃣ Add user to trip
    const { error: insertError } = await supabase
      .from("trip_users")
      .insert([{ trip_id: tripId, user_id: session.user.id }]);

    if (insertError) {
      alert("Could not join trip" );
    } else {
      toast.current?.show({ severity: "success", summary: "Joined trip successfully!" });
      setJoinVisible(false);
      setTripCode("");
      // Refresh trips list
      setTimeout(() => window.location.reload(), 1000);
    }
  };

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
        <button
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full bg-neo-moss hover:bg-blue-500 shadow-lg transition-colors"
        aria-label="Add an existing trip"
        onClick={() => setJoinVisible(true)}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add an existing trip</span>
      </button>

      {/* Join Trip Dialog */}
      <Dialog
        header="Join Existing Trip"
        visible={joinVisible}
        style={{ width: "400px", padding:"10px", backgroundColor:"#ebcbae"}}
        onHide={() => setJoinVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <span className="p-float-label">
            <InputText
              id="tripCode"
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
              placeholder="Enter trip code"
              className="w-full border-2 border-black-500"
            />
          </span>

          <button
            onClick={handleJoinTrip}
            className="w-full text-black bg-[#4f9da6] py-2 rounded-lg font-semibold transition-colors">
            Join Trip
          </button>
        </div>
      </Dialog>
    </main>
  );
}
