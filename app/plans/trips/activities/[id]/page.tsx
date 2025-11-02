"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Save, X, Edit2 } from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { supabase } from "@/lib/supbabaseClient";
import { useUserId, useUserName } from "../../../../../lib/userUtils";
import ActivityModal from "../../../../components/ActivityModal";
import { Activity, initialActivityState } from "../../../../types/activity";
import { formatTime } from "@/lib/converterMethod";

export default function ActivityPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [activities, setActivities] = useState<Record<number, Activity[]>>({});
  const [loading, setLoading] = useState(true);

  // Modal & Misc State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [modalInitialData, setModalInitialData] =
    useState<Activity>(initialActivityState);
  const toast = useRef<Toast>(null);
  const userId = useUserId();
  const userName = useUserName();

  // 🔹 Fetch Trip Info
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
          detail: "Failed to load trip details.",
          life: 3000,
        });
      } else {
        setTrip(data);
        const days = data.trip_duration || 1;
        const init: Record<number, Activity[]> = {};
        for (let i = 1; i <= days; i++) init[i] = [];
        setActivities(init);
      }
      setLoading(false);
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  // 🔹 Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("activity_category")
        .select("activity_category_id, category_name");

      if (error)
        return console.error("Error fetching categories:", error.message);

      const map: Record<string, string> = {};
      data.forEach((c: any) => (map[c.activity_category_id] = c.category_name));
      setCategories(map);
    };
    fetchCategories();
  }, []);

  // 🔹 Fetch Activities Grouped by Day
  useEffect(() => {
    const fetchActivities = async () => {
      if (!tripId || !trip) return;

      const { data, error } = await supabase
        .from("days")
        .select("day_id, day_number, activities(*)")
        .eq("trip_id", tripId);

      if (error) {
        console.error("Error fetching activities:", error.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load activities.",
          life: 3000,
        });
        return;
      }

      const grouped: Record<number, Activity[]> = {};
      for (let i = 1; i <= (trip.trip_duration || 1); i++) grouped[i] = [];

      data.forEach((day) => {
        const list = day.activities || [];
        if (Array.isArray(list)) {
          grouped[day.day_number] = list.map((a) => ({
            activity_id: a.activity_id,
            name: a.activity_name,
            startTime: a.start_time,
            cost: a.cost,
            category_id: a.activity_category_id,
            user_id: a.user_id,
          }));
        }
      });

      setActivities(grouped);
    };

    fetchActivities();
  }, [tripId, trip]);

  const totalDays = trip?.trip_duration || 1;

  // --- Modal Handlers ---
  const handleOpenAddModal = () => {
    // Always start with a clean slate for new activity
    setModalInitialData(initialActivityState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    const act = activities[currentDay]?.[index];
    if (act) {
      // Pass the full activity data, including the necessary activity_id
      setModalInitialData({ ...act, cost: act.cost || "" });
      setIsModalOpen(true);
    }
    // You can remove setIsEditing(true) and setEditIndex(index) entirely
  };

  const handleCloseModal = () => setIsModalOpen(false);

  // --- SAVE / ADD ACTIVITY ---
  const handleModalSubmit = async (data: Activity) => {
    // Determine if we are updating by checking for the activity_id
    // If data.activity_id is a string (a UUID), isUpdating will be true.
    const isUpdating = !!data.activity_id;

    try {
      const formatted: Activity = {
        ...data,
        cost: data.cost === "" ? 0 : Number(data.cost),
      };

      if (isUpdating) {
        // ===============================================
        // 🚨 UPDATE LOGIC 🚨
        // ===============================================

        const { error: updateErr } = await supabase
          .from("activities")
          .update({
            start_time: formatted.startTime,
            activity_name: formatted.name,
            cost: formatted.cost,
            activity_category_id: formatted.category_id,
          })
          // CRITICAL: Filter by the ID from the submitted data
          .eq("activity_id", formatted.activity_id);

        if (updateErr) throw updateErr;

        // Update local state by finding and replacing the existing activity
        setActivities((prev) => {
          const dayActivities = prev[currentDay];
          const activityIndex = dayActivities.findIndex(
            (act) => act.activity_id === formatted.activity_id
          );

          if (activityIndex > -1) {
            const newDayActivities = [...dayActivities];
            newDayActivities[activityIndex] = formatted;
            return { ...prev, [currentDay]: newDayActivities };
          }
          return prev;
        });

        toast.current?.show({
          severity: "success",
          summary: "Activity Updated",
          detail: "Activity successfully modified!",
          life: 3000,
        });
      } else {
        // ===============================================
        // 🚀 INSERT LOGIC (Only runs if activity_id is missing) 🚀
        // ===============================================

        // 1️⃣ Ensure this day exists in the "days" table
        let { data: dayRow, error: fetchErr } = await supabase
          .from("days")
          .select("day_id")
          .eq("trip_id", tripId)
          .eq("day_number", currentDay)
          .single();

        // if day doesn't exist, create it
        if (fetchErr && fetchErr.code === "PGRST116") {
          const { data: insertedDay, error: insertDayErr } = await supabase
            .from("days")
            .insert([
              { trip_id: tripId, day_number: currentDay, user_id: userId },
            ])
            .select("day_id")
            .single();

          if (insertDayErr) throw insertDayErr;
          dayRow = insertedDay;
        } else if (fetchErr) {
          throw fetchErr;
        }

        // 2️⃣ Insert activity linked to that day
        const { data: newActivity, error: actErr } = await supabase
          .from("activities")
          .insert([
            {
              created_by: userName,
              day_id: dayRow?.day_id,
              start_time: formatted.startTime,
              activity_name: formatted.name,
              cost: formatted.cost,
              activity_category_id: formatted.category_id,
              user_id: userId,
            },
          ])
          .select("activity_id")
          .single();

        if (actErr) throw actErr;

        formatted.activity_id = newActivity.activity_id;
        formatted.user_id = userId as string; // Add user_id to the local state for delete permissions

        // 3️⃣ Update local state
        setActivities((prev) => ({
          ...prev,
          [currentDay]: [...(prev[currentDay] || []), formatted],
        }));

        toast.current?.show({
          severity: "success",
          summary: "Activity Added",
          detail: "Activity successfully saved!",
          life: 3000,
        });
      }

      // Close modal after successful operation (for both insert and update)
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(
        `Error ${isUpdating ? "updating" : "saving"} activity:`,
        err.message
      );
      toast.current?.show({
        severity: "error",
        summary: `${isUpdating ? "Update" : "Save"} Failed`,
        detail: err.message || "Could not save activity.",
        life: 4000,
      });
    }
  };

  // --- DELETE ACTIVITY ---
  const handleRemoveActivity = async (day: number, index: number) => {
    try {
      const act = activities[day]?.[index];
      if (!act) return;

      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("activity_id", act.activity_id);
      if (error) throw error;

      setActivities((prev) => ({
        ...prev,
        [day]: prev[day].filter((_, i) => i !== index),
      }));

      toast.current?.show({
        severity: "success",
        summary: "Activity Removed",
        detail: "Activity successfully deleted!",
        life: 3000,
      });
    } catch (err: any) {
      console.error("Error deleting activity:", err.message);
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: err.message || "Could not delete activity.",
        life: 4000,
      });
    }
  };

  // --- Sort Activities by Start Time ---
  const sortedActivities = useMemo(() => {
    const list = activities[currentDay] || [];
    return [...list].sort((a, b) =>
      a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0
    );
  }, [activities, currentDay]);

  if (loading || !trip) {
    return (
      <div className="flex justify-center items-center min-h-screen  ">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
      </div>
    );
  }

  return (
    <main className="min-h-screen   p-4 sm:p-6">
      <Toast ref={toast} position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <button
          onClick={() => router.push(`/plans/${tripId}`)}
          className="flex items-center gap-2 p-2 sm:p-3 bg-brown-700 hover:bg-gray-700 rounded-lg transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold flex-1 text-center ">
          Activities for {trip.location}
        </h1>
      </div>

      {/* Day Navigation */}
      <div className="flex justify-center items-center gap-3 sm:gap-4 mb-8">
        <button
          onClick={() => setCurrentDay((p) => Math.max(1, p - 1))}
          disabled={currentDay === 1}
          className="p-2 sm:p-3 bg-brown-700 rounded-full hover:bg-gray-700 disabled:opacity-50 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold ">
            Day {currentDay} of {totalDays}
          </h2>
          {trip?.trip_start_date && (
            <p className="text-base sm:text-lg -300">
              {new Date(
                new Date(`${trip.trip_start_date}T00:00:00Z`).setUTCDate(
                  new Date(`${trip.trip_start_date}T00:00:00Z`).getUTCDate() +
                    (currentDay - 1)
                )
              ).toLocaleDateString("en-US", { timeZone: "UTC" })}
            </p>
          )}
        </div>

        <button
          onClick={() => setCurrentDay((p) => Math.min(totalDays, p + 1))}
          disabled={currentDay === totalDays}
          className="p-2 sm:p-3 bg-brown-700 rounded-full hover:bg-gray-700 disabled:opacity-50 active:scale-95 transition-transform"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Activity Table */}
      <div className="max-w-4xl mx-auto bg-brown-700 p-4 sm:p-6 rounded-lg shadow-lg ">
        {sortedActivities.length ? (
          <>
            {/* Header */}
            <div className="grid grid-cols-4 sm:grid-cols-[1fr_2fr_1fr_1fr_1fr] font-bold text-sm sm:text-base border-b border-gray-700 pb-2 mb-2">
              <div>Time</div>
              <div>Activity</div>
              <div>Cost</div>
              <div>Category</div>
              <div className="hidden sm:block text-right">Actions</div>
            </div>

            {/* Rows */}
            {sortedActivities.map((act, i) => (
              <div
                key={i}
                className="grid grid-cols-4 sm:grid-cols-[1fr_2fr_1fr_1fr_1fr] border-b border-gray-700 py-4 text-sm sm:text-base font-semibold items-start"
              >
                {/* Time */}
                <div>{formatTime(act.startTime)}</div>

                {/* Activity */}
                <div className="break-words">{act.name}</div>

                {/* Cost */}
                <div className="text-green-600">
                  ${Number(act.cost || 0).toFixed(2)}
                </div>

                {/* Category */}
                <div className="-300 break-words">
                  {categories[act.category_id] || "N/A"}
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 sm:justify-end mt-2 sm:mt-0">
                  <button
                    onClick={() => handleOpenEditModal(i)}
                    className="p-2 bg-neo-moss hover:bg-blue-500 rounded-lg transition active:scale-95"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveActivity(currentDay, i)}
                    className="p-2 bg-red-rum hover:bg-red-500 rounded-lg transition active:scale-95"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="text-center -400">No activities yet.</p>
        )}
        {/* Add Button */}
        <div className="flex justify-end mt-5">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 sm:py-2.5 bg-neo-moss hover:bg-blue-500 rounded-lg text-sm sm:text-base font-semibold  transition active:scale-95"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white font-bold" />
            <span className="text-white font-bold"> Add Activity</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activityData={modalInitialData}
        onSubmit={handleModalSubmit}
        isEdit={isEditing}
        editIndex={editIndex}
      />
    </main>
  );
}
