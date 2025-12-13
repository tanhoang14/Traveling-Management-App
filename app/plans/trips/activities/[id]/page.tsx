"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  NotepadText,
  X,
  Edit2,
  Link,
  Pencil,
} from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { supabase } from "@/lib/supbabaseClient";
import { useUserId, useUserName } from "../../../../../lib/userUtils";
import ActivityModal from "../../../../components/ActivityModal";
import { Activity, initialActivityState } from "../../../../types/types";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { formatTime } from "@/lib/converterMethod";
import { useSupabaseSession } from "../../../../components/SupabaseProvider";

export default function ActivityPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayTitles, setDayTitles] = useState<Record<number, string>>({});
  const [activities, setActivities] = useState<Record<number, Activity[]>>({});
  const [loading, setLoading] = useState(true);

  // Modal & Misc State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false);
  const [titleInput, setTitleInput] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [modalInitialData, setModalInitialData] = useState<Activity>(initialActivityState);
  const toast = useRef<Toast>(null);
  const userId = useUserId();
  const userName = useUserName();
  const { session } = useSupabaseSession();

  // 1️⃣ Redirect if user is not logged in
  useEffect(() => {
    if (session === null) {
      router.replace("/login");
    }
  }, [session, router]);

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
          className: "bg-brown-600",
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
        .select("day_id, day_number, title, activities(*)")
        .eq("trip_id", tripId);

      if (error) {
        console.error("Error fetching activities:", error.message);
        toast.current?.show({
          severity: "error",
          className: "bg-brown-600",
          summary: "Error",
          detail: "Failed to load activities.",
          life: 3000,
        });
        return;
      }

      const grouped: Record<number, Activity[]> = {};
      const titles: Record<number, string> = {};

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
            link: a.link,
            note: a.note,
          }));
        }
        titles[day.day_number] = day.title || "";
      });

      setDayTitles(titles);
      setActivities(grouped);
    };

    fetchActivities();
  }, [tripId, trip]);

  const totalDays = trip?.trip_duration || 1;

  // --- Modal Handlers ---
  const handleOpenAddModal = () => {
    setModalInitialData(initialActivityState);
    setIsEditing(false); // <--- reset editing mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (activityId: string) => {
    const act = activities[currentDay]?.find(
      (a) => a.activity_id === activityId
    );
    if (act) {
      setModalInitialData({ ...act, cost: act.cost || "" });
      setIsEditing(true); // <--- set editing mode
      setIsModalOpen(true);
    }
  };

  const handleOpenNoteDialog = async (activityId: string) => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("note")
        .eq("activity_id", activityId)
        .single();

      if (error) throw error;

      if (data?.note) {
        setSelectedNote(data.note);
        setIsNoteDialogOpen(true);
      } else {
        toast.current?.show({
          severity: "info",
          className: "bg-brown-600",
          summary: "No Note Found",
          detail: "This activity has no note yet.",
          life: 3000,
        });
      }
    } catch (err: any) {
      console.error("Error fetching note:", err.message);
      toast.current?.show({
        severity: "error",
        className: "bg-brown-600",
        summary: "Error",
        detail: "Could not load note.",
        life: 3000,
      });
    }
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
            link: formatted.link,
            note: formatted.note,
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
          className: "bg-brown-600",
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
              link: formatted.link,
              activity_category_id: formatted.category_id,
              user_id: userId,
              note: formatted.note,
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
          className: "bg-brown-600",
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
        className: "bg-brown-600",
        summary: `${isUpdating ? "Update" : "Save"} Failed`,
        detail: err.message || "Could not save activity.",
        life: 4000,
      });
    }
  };

  // --- DELETE ACTIVITY ---
  const confirmedDelete = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("activity_id", activityId);

      if (error) throw error;

      // Update local state by filtering out the deleted activity by ID
      setActivities((prev) => ({
        ...prev,
        [currentDay]: prev[currentDay].filter(
          (act) => act.activity_id !== activityId
        ),
      }));

      toast.current?.show({
        severity: "success",
        className: "bg-brown-600",
        summary: "Activity Removed",
        detail: "Activity successfully deleted!",
        life: 3000,
      });
    } catch (err: any) {
      console.error("Error deleting activity:", err.message);
      toast.current?.show({
        severity: "error",
        className: "bg-brown-600",
        summary: "Delete Failed",
        detail: err.message || "Could not delete activity.",
        life: 4000,
      });
    }
  };

  const handleRemoveActivity = (activityId: string) => {
    confirmDialog({
      message: "Are you sure you want to delete this activity?",
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => confirmedDelete(activityId),
    });
  };

  // --- EDIT DAY TITLE ---
  const handleEditTitleClick = () => {
    // Check if there is at least one activity for the current day
    const dayActivities = activities[currentDay] || [];
    if (dayActivities.length === 0) {
      toast.current?.show({
        severity: "warn",
        className: "bg-brown-600",
        summary: "No Activities",
        detail:
          "Please add at least one activity before editing the day title.",
        life: 3000,
      });
      return; // stop opening the title dialog
    }

    // If there is at least one activity, allow editing
    setTitleInput(dayTitles[currentDay] || "");
    setIsTitleDialogOpen(true);
  };

  const handleSaveTitle = async () => {
    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from("days")
        .update({ title: titleInput })
        .eq("trip_id", tripId)
        .eq("day_number", currentDay)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setDayTitles((prev) => ({
        ...prev,
        [currentDay]: titleInput,
      }));

      setIsTitleDialogOpen(false);
      toast.current?.show({
        severity: "success",
        className: "bg-brown-600",
        summary: "Title Updated",
        detail: "Day title successfully saved!",
        life: 3000,
      });
    } catch (err: any) {
      console.error("Error updating day title:", err.message);
      toast.current?.show({
        severity: "error",
        className: "bg-brown-600",
        summary: "Update Failed",
        detail: err.message || "Could not save title.",
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
          <div className="mt-1 flex justify-center items-center gap-1">
            <p className="font-bold text-lg sm:text-xl mr-1">
              Activity Title: {dayTitles[currentDay]}
            </p>
            <Pencil
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer"
              onClick={handleEditTitleClick}
            />
          </div>
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

                {/* Activity && Link */}
                <div className="break-words flex items-center gap-2 flex-wrap">
                  <span>{act.name}</span>
                  <div className="flex items-center">
                    {act.note &&
                      act.note.replace(/<[^>]*>/g, "").trim() !== "" && (
                        <button
                          onClick={() => handleOpenNoteDialog(act.activity_id)}
                          className="text-blue-400 hover:text-blue-300 transition mr-2"
                        >
                          <NotepadText
                            color="#36454F"
                            className="w-6 h-6 sm:w-5 sm:h-5"
                          />
                        </button>
                      )}
                    {act.link && (
                      <a
                        href={act.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition mr-2"
                      >
                        <Link
                          color="#36454F"
                          className="w-6 h-6 sm:w-5 sm:h-5"
                        />
                      </a>
                    )}
                  </div>
                </div>

                {/* Cost */}
                <div className="text-green-700">
                  ${Number(act.cost || 0).toFixed(2)}
                </div>

                {/* Category */}
                <div className="-300 text-no-wrap">
                  {categories[act.category_id] || "N/A"}
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 sm:justify-end mt-2 sm:mt-0">
                  <button
                    onClick={() => handleOpenEditModal(act.activity_id)}
                    className="p-2 bg-neo-moss hover:bg-blue-500 rounded-lg transition active:scale-95"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveActivity(act.activity_id)}
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

      {/* Note Dialog */}
      <Dialog
        header={
          <span className="text-lg font-bold text-white">Activity Note</span>
        }
        visible={isNoteDialogOpen}
        style={{
          width: "90%",
          maxWidth: "500px",
          padding: "10px",
          bottom: "5rem",
          backgroundColor: "#5C4033",
        }}
        modal
        dismissableMask
        closeIcon={<X className="text-white" />}
        className="rounded-xl overflow-hidden"
        contentClassName="bg-brown-1000 text-white p-5 rounded-b-xl"
        onHide={() => setIsNoteDialogOpen(false)}
      >
        <div>
          {selectedNote ? (
            <div
              className="rich-text-content prose prose-sm max-w-none text-white"
              dangerouslySetInnerHTML={{ __html: selectedNote }}
            />
          ) : (
            <p className="italic text-gray-400">No note available.</p>
          )}
        </div>
      </Dialog>

      <Dialog
        header={
          <span className="text-lg font-bold text-white">Edit Day Title</span>
        }
        visible={isTitleDialogOpen}
        style={{
          width: "90%",
          maxWidth: "400px",
          padding: "10px",
          backgroundColor: "#5C4033",
        }}
        modal
        className="rounded-xl overflow-hidden"
        contentClassName="bg-brown-1000 text-white p-5 rounded-b-xl"
        onHide={() => setIsTitleDialogOpen(false)}
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="border border-gray-400 rounded px-2 py-1 text-base sm:text-lg w-full"
            placeholder="Enter day title"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsTitleDialogOpen(false)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTitle}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
            >
              Save
            </button>
          </div>
        </div>
      </Dialog>
      <ConfirmDialog
        className="bg-brown-600 p-4"
        footer={(options) => (
          <div className="flex justify-center gap-4 mt-4">
            <button
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-medium"
              onClick={options.reject}
            >
              No
            </button>

            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
              onClick={options.accept}
            >
              Yes, Delete
            </button>
          </div>
        )}
      />
    </main>
  );
}
