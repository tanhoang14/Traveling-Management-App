"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { supabase } from "@/lib/supbabaseClient";
import { ProgressSpinner } from "primereact/progressspinner";
import { Avatar } from "primereact/avatar";
import { ExternalLink } from "lucide-react";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Trip, Traveler, Activity } from "@/app/types/activity";
import { getTripDayUTC, formatUTCDate } from "@/lib/converterMethod";

export default function TripOverview() {
  const router = useRouter();
  const params = useParams();

  const tripId = params?.id as string;
  const toast = useRef<Toast>(null);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<
    {
      day_number: number;
      firstActivityName: string;
      totalAmount: number;
      dayDate: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [newTravelerEmail, setNewTravelerEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingTraveler, setAddingTraveler] = useState(false);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [showTripCodePopup, setShowTripCodePopup] = useState(false);

  const handleCopyTripCode = () => {
    if (!trip?.trip_code) return;
    navigator.clipboard.writeText(trip.trip_code).then(() => {
      toast.current?.show({
        severity: "success",
        summary: "Copied!",
        detail: `Trip code "${trip.trip_code}" copied to clipboard.`,
        life: 2000,
      });
    });
  };

  // Fetch trip
  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("trip_id", tripId)
        .single();

      if (error) {
        console.error("Error fetching trip:", error.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch trip.",
          life: 3000,
        });
      } else {
        setTrip(data);
      }
      setLoading(false);
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!tripId || !trip) return;

      const { data, error } = await supabase
        .from("days")
        .select(
          `
          day_id,
          day_number,
          trip_id,
          activities (
            activity_id,
            activity_name,
            cost
          )
        `
        )
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true });

      if (error) {
        console.error("Error fetching activities:", error.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch activities.",
          life: 3000,
        });
        return;
      }

      const startDate = new Date(trip?.trip_start_date);

      const grouped = data.map((day: any) => {
        const acts = Array.isArray(day.activities)
          ? day.activities
          : [day.activities].filter(Boolean);
        const firstActivityName = acts.length
          ? acts[0].activity_name
          : "No activities";
        const totalAmount = acts.reduce(
          (sum: number, a: Activity) => sum + (a.cost || 0),
          0
        );

        // Calculate exact date for this day
        const dayDate = getTripDayUTC(trip.trip_start_date, day.day_number);
        return {
          day_number: day.day_number,
          firstActivityName,
          totalAmount,
          dayDate, // store formatted date
        };
      });

      setActivities(grouped);
    };

    fetchActivities();
  }, [tripId, trip]);

  // Fetch travelers
  useEffect(() => {
    const fetchTravelers = async () => {
      if (!tripId) return;

      const { data, error } = await supabase
        .from("trip_users")
        .select(
          `
          trip_user_id,
          users (
            user_id,
            name,
            image_url
          )
        `
        )
        .eq("trip_id", tripId);

      if (error) {
        console.error("Error fetching travelers:", error.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch travelers.",
          life: 3000,
        });
        return;
      }

      if (data) {
        const formatted = data.map((row: any) => ({
          id: row.trip_user_id,
          name: row.users.name,
          avatar: row.users.image_url,
        }));
        setTravelers(formatted);
      }
    };

    fetchTravelers();
  }, [tripId]);

  // Add traveler
  const handleAddTraveler = async () => {
    if (!newTravelerEmail.trim()) return;

    setAddingTraveler(true);

    try {
      // Check if user exists
      const { data: user, error: fetchUserError } = await supabase
        .from("users")
        .select("user_id, name, email, image_url")
        .eq("email", newTravelerEmail.trim())
        .single();

      if (fetchUserError) {
        console.error("User not found:", fetchUserError.message);
        toast.current?.show({
          severity: "warn",
          summary: "User Not Found",
          detail: "Make sure the user has an account.",
          life: 3000,
        });
        return;
      }

      // Check if already added
      const { data: existingLink } = await supabase
        .from("trip_users")
        .select("*")
        .eq("trip_id", tripId)
        .eq("user_id", user.user_id)
        .single();

      if (existingLink) {
        toast.current?.show({
          severity: "info",
          summary: "Already Added",
          detail: "This user is already a traveler.",
          life: 3000,
        });
        return;
      }

      // Insert into trip_users
      const { error: insertError } = await supabase.from("trip_users").insert({
        trip_id: tripId,
        user_id: user.user_id,
      });

      if (insertError) {
        console.error("Error adding traveler:", insertError.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to add traveler.",
          life: 3000,
        });
        return;
      }

      // Update state
      setTravelers([
        ...travelers,
        {
          id: user.user_id,
          name: user.name,
          avatar: user.image_url,
        },
      ]);

      setNewTravelerEmail("");
      setIsModalOpen(false);

      toast.current?.show({
        severity: "success",
        summary: "Traveler Added",
        detail: `${user.name} has been added to the trip!`,
        life: 3000,
      });
    } finally {
      setAddingTraveler(false);
    }
  };

  // Remove traveler
  const handleRemoveTraveler = (tripUserId: string, travelerName: string) => {
    confirmDialog({
      message: `Are you sure you want to remove ${travelerName} from this trip?`,
      header: "Confirm Removal",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          // ✅ Attempt to delete from Supabase
          const { error: deleteError } = await supabase
            .from("trip_users")
            .delete()
            .eq("trip_user_id", tripUserId);

          if (deleteError) throw deleteError;

          // ✅ Refetch updated traveler list
          const { data: refreshedTravelers, error: fetchError } = await supabase
            .from("trip_users")
            .select(
              `
              trip_user_id,
              users (
                user_id,
                name,
                image_url
              )
            `
            )
            .eq("trip_id", tripId);

          if (fetchError) throw fetchError;

          // ✅ Update state with new data
          if (refreshedTravelers) {
            setTravelers(
              refreshedTravelers.map((row: any) => ({
                id: row.trip_user_id,
                name: row.users.name,
                avatar: row.users.image_url,
              }))
            );
          }

          // ✅ Show success message
          toast.current?.show({
            severity: "success",
            summary: "Traveler Removed",
            detail: `${travelerName} has been removed from the trip.`,
            life: 3000,
          });
        } catch (err: any) {
          console.error("Error removing traveler:", err.message || err);

          toast.current?.show({
            severity: "error",
            summary: "Error Removing Traveler",
            detail: err.message?.includes("permission denied")
              ? "You don’t have permission to remove this traveler. Check your RLS policy."
              : "An unexpected error occurred. Please try again.",
            life: 4000,
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen  ">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen  ">
        <p className="text-lg">Trip not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleShareOverview = () => {
    if (!trip?.trip_code) return;

    // Copy trip code to clipboard
    navigator.clipboard
      .writeText(trip.trip_code)
      .then(() => {
        toast.current?.show({
          severity: "success",
          summary: "Copied!",
          detail: `Trip code "${trip.trip_code}" copied to clipboard.`,
          life: 2000,
        });
      })
      .catch((err) => {
        console.error("Failed to copy trip code:", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to copy trip code.",
          life: 2000,
        });
      });
  };

  return (
    <main className="min-h-screen   p-8">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog
        className="bg-brown-700  border border-gray-700 rounded-xl shadow-xl"
        contentClassName="bg-brown-700 "
        headerClassName="  border-b border-gray-700"
        pt={{
          footer: {
            className: "flex justify-center gap-3",
          },
        }}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/plans`)}
          className="flex items-center gap-2 p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 " />
        </button>
        <h1 className="text-3xl font-bold flex-1 text-center">
          🧳 {trip.location}
        </h1>
        <button
          className="flex items-center gap-2 p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
          onClick={() => router.push(`/plans/trips/edit/${tripId}`)}
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-brown-700  rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Overview</h2>
          <div className="relative">
            <button
              onClick={() => setShowTripCodePopup((prev) => !prev)}
              className="rounded-full transition"
              title="Show Trip Code"
            >
              <ExternalLink className="w-5 h-5 text-black" />
            </button>

            {showTripCodePopup && (
              <div className="absolute right-0 mt-2 w-48 p-3 bg-white border border-gray-300 rounded shadow-lg z-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold break-all">
                    {trip?.trip_code}
                  </span>
                  <button
                    onClick={handleCopyTripCode}
                    className="ml-2 px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* Overview */}
            <div className="text-sm border border-gray-600 rounded-lg p-4 text-nowrap">
              <p className="font-semibold">
                Start: {formatUTCDate(trip.trip_start_date)}
              </p>
              <p className="font-semibold">
                End: {formatUTCDate(trip.trip_end_date)}
              </p>
              <p className="font-semibold">⏱ {trip.trip_duration} days</p>
              <p className="font-semibold">💰 Budget: ${trip.budget}</p>
            </div>

            {/* Travelers */}
            <div className="border border-gray-600 rounded-lg p-4 flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-base">Travelers</h3>
                <button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 " />
                </button>
              </div>

              <ul className="space-y-2">
                {travelers.length ? (
                  travelers.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 text-sm -300"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          image={t.avatar}
                          size="large"
                          shape="circle"
                          className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14"
                        />
                        {t.name}
                      </div>
                      <button
                        onClick={() => handleRemoveTraveler(t.id, t.name)}
                        className="text-red-500 hover:text-red-400 font-bold"
                      >
                        X
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-sm -400">No travelers added</p>
                )}
              </ul>

              {/* Add Traveler Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                  <div className="bg-brown-700 rounded-xl p-6 w-full max-w-sm relative">
                    <h3 className="text-lg font-semibold mb-4 ">
                      Add Traveler
                    </h3>
                    <input
                      type="email"
                      placeholder="Please enter their email"
                      value={newTravelerEmail}
                      onChange={(e) => setNewTravelerEmail(e.target.value)}
                      className="w-full p-2 mb-4 rounded bg-white text-sm "
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded "
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddTraveler}
                        disabled={addingTraveler}
                        className="px-4 py-2 bg-white rounded "
                      >
                        {addingTraveler ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Notes */}
          <div className="border border-gray-600 rounded-lg p-4">
            <h3 className="font-semibold text-base mb-2">Notes</h3>
            <p className="text-sm -300">{trip.note || "No notes yet."}</p>
          </div>
        </div>

        {/* Activity */}
        <div className="border border-gray-600 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-base">Activity</h3>
            <button
              onClick={() => router.push(`/plans/trips/activities/${tripId}`)}
            >
              <a className="italic text-brown-moss">View Details</a>
            </button>
          </div>
          <div className="text-sm -300">
            {activities.length ? (
              <ul className="space-y-1">
                {activities.map((act) => (
                  <li key={act.day_number} className="flex justify-between">
                    <span className="">
                      <span className="font-medium font-semibold text-nowrap sm:inline block">
                        Day {act.day_number} ({act.dayDate})
                      </span>{" "}
                      <span className="-300 sm:inline block">
                        {act.firstActivityName}
                      </span>
                    </span>
                    <span className="-300">
                      Total Cost:{" "}
                      <span className="font-semibold text-green-600">
                        ${Number(act.totalAmount || 0).toFixed(2)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm -400">No activities yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
