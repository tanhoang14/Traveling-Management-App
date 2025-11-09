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
import { StayBooking, FlightBooking } from "../types/types";
import StackedCards from "../components/StackedCards";

export default function TripsPage() {
  const router = useRouter();
  const { session } = useSupabaseSession();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinVisible, setJoinVisible] = useState(false);
  const [tripCode, setTripCode] = useState("");
  const [stays, setStays] = useState<StayBooking[]>([]);
  const [flights, setFlights] = useState<FlightBooking[]>([]);
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
            image_url,
            trip_start_date,
            trip_end_date,
            trip_duration,
            budget
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error.message);
      } else {
        const now = new Date();
        // ✅ Only include trips that are ongoing or upcoming
        const formatted = (data || [])
          .map((row) => row.trips as any)
          .filter(
            (trip) => trip && new Date(trip.trip_end_date) >= now
          );
        setTrips(formatted);
      }
      setLoading(false);
    };

    fetchTrips();
  }, [session]);

  // Fetch flight booking
  useEffect(() => {
    const fetchFlightBookings = async () => {
      const { data, error } = await supabase
        .from("flight_bookings")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching flight bookings:", error.message);
      } else {
        setFlights(data || []);
      }
    };

    fetchFlightBookings();
  }, []);

  // Fetch stay bookings
  useEffect(() => {
    const fetchStayBookings = async () => {
      const { data, error } = await supabase
        .from("stay_bookings")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stay bookings:", error.message);
      } else {
        setStays(data || []);
      }
    };

    fetchStayBookings();
  }, []);

  const recommendedDestinations = [
    {
      name: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
      description:
        "The city of lights and love — explore art, cuisine, and history around every corner.",
    },
    {
      name: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      description:
        "Relax on the beaches, dive into turquoise waters, or explore lush rice terraces and temples.",
    },
    {
      name: "Kyoto, Japan",
      image: "https://images.unsplash.com/photo-1549693578-d683be217e58",
      description:
        "Step into Japan’s ancient past with serene temples, cherry blossoms, and traditional tea houses.",
    },
    {
      name: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      description:
        "Marvel at whitewashed houses with blue domes, breathtaking sunsets, and Aegean Sea views.",
    },
    {
      name: "Reykjavik, Iceland",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      description:
        "Discover glaciers, waterfalls, and the mesmerizing Northern Lights under Arctic skies.",
    },
    {
      name: "Machu Picchu, Peru",
      image: "https://images.unsplash.com/photo-1503437313881-503a91226402",
      description:
        "Explore the ancient Incan citadel hidden high in the Andes — a wonder of the world shrouded in mist.",
    },
  ];

  const handleJoinTrip = async () => {
    if (!tripCode || !session?.user) {
      toast.current?.show({ severity: "warn", summary: "Enter a valid code" });
      return;
    }

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

    const { error: insertError } = await supabase
      .from("trip_users")
      .insert([{ trip_id: tripId, user_id: session.user.id }]);

    if (insertError) {
      alert("Could not join trip");
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Joined trip successfully!",
      });
      setJoinVisible(false);
      setTripCode("");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <main className="min-h-screen px-6 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">🧳 My Trips</h1>

      <div className="flex flex-col items-center justify-center mt-10">
        {loading ? (
          <ProgressSpinner
            style={{ width: "50px", height: "50px" }}
            strokeWidth="8"
            fill="var(--surface-ground)"
            animationDuration=".5s"
          />
        ) : trips.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              You don’t have any upcoming trips.
            </p>
            <Card
              onClick={() => router.push("/plans/trips/create")}
              className="flex flex-col items-center justify-center cursor-pointer 
                          border-2 border-dashed border-gray-500 
                          px-6 py-10 rounded-lg font-semibold 
                          hover:bg-brown-700 transition w-full sm:w-96"
            >
              <p>Create New Trip</p>
            </Card>
          </div>
        ) : (
          <section className="w-full max-w-5xl">
            {/* Trip Cards Grid */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">⭐ Current Trips</h2>
              <a
                onClick={() => router.push("/plans/trips/traveled")}
                className="text-blue-600 hover:underline text-sm cursor-pointer"
              >
                View Traveled Trips →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {trips.map((trip, index) => (
                <Card
                  key={trip.trip_id ?? `trip-${index}`}
                  onClick={() => router.push(`/plans/${trip.trip_id}`)}
                  className="rounded-xl overflow-hidden bg-brown-700 cursor-pointer hover:shadow-lg transition"
                >
                  <img
                    src={trip.image_url}
                    alt={trip.location}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 text-black">
                    <h3 className="text-lg font-bold mb-1">{trip.location}</h3>
                    <p className="text-sm mb-1">
                      📅 {new Date(trip.trip_start_date).toLocaleDateString()} -{" "}
                      {new Date(trip.trip_end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm mb-1">⏱ {trip.trip_duration} days</p>
                    <p className="text-sm">
                      💰 Budget:{" "}
                      <span className="text-green-800">${trip.budget}</span>
                    </p>
                  </div>
                </Card>
              ))}

              {/* Create Trip Button Inside Grid */}
              <Card
                onClick={() => router.push("/plans/trips/create")}
                className="flex flex-col items-center justify-center cursor-pointer 
              border-2 border-dashed border-gray-500 
              px-6 py-10 rounded-lg font-semibold 
              hover:bg-brown-700 transition"
              >
                <p>Create New Trip</p>
              </Card>
            </div>
          </section>
        )}

        {/* Travel Recommendations Section */}
        <section className="mt-10 mb-10 w-full max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">🌍 Recommended Destinations</h2>
          <StackedCards recommendedDestinations={recommendedDestinations} />
        </section>

        {/* Flight Booking Section */}
        <section className="mt-10 w-full max-w-5xl">
          <h2 className="text-xl font-semibold mb-3">✈️ Flight Booking</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {flights.length > 0 ? (
              flights.map((site) => (
                <a
                  key={site.id}
                  href={site.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[280px] sm:min-w-[320px] bg-white shadow-md rounded-xl overflow-hidden snap-start hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-full h-40 flex items-center justify-center"
                    style={{ backgroundColor: site.color }}
                  >
                    <img
                      src={site.logo_url}
                      alt={site.name}
                      className="w-32 h-12 object-contain bg-white p-2 rounded-md"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{site.name}</h3>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-gray-500">No flight booking data available.</p>
            )}
          </div>
        </section>

        {/* Stay Booking Section */}
        <section className="mt-10 w-full max-w-5xl">
          <h2 className="text-xl font-semibold mb-3">🏠 Stay Booking</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {stays.length > 0 ? (
              stays.map((site) => (
                <a
                  key={site.id}
                  href={site.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[280px] sm:min-w-[320px] bg-white shadow-md rounded-xl overflow-hidden snap-start hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-full h-40 flex items-center justify-center"
                    style={{ backgroundColor: site.color }}
                  >
                    <img
                      src={site.logo_url}
                      alt={site.name}
                      className="w-32 h-12 object-contain bg-white p-2 rounded-md"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{site.name}</h3>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-gray-500">No stay booking data available.</p>
            )}
          </div>
        </section>

        {/* Floating Join Trip Button */}
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
          style={{
            width: "400px",
            padding: "10px",
            backgroundColor: "#ebcbae",
          }}
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
              className="w-full text-black bg-[#4f9da6] py-2 rounded-lg font-semibold transition-colors"
            >
              Join Trip
            </button>
          </div>
        </Dialog>
      </div>
    </main>
  );
}
