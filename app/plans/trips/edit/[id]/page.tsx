"use client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { supabase } from "../../../../../lib/supbabaseClient";
import { useUserName } from "../../../../../lib/userUtils";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const userName = useUserName();

  const toast = useRef<Toast>(null);

  // Fetch existing trip data
  useEffect(() => {
    const fetchTrip = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("trip_id", tripId)
        .single();

      if (error) {
        console.error("Error fetching trip:", error.message);
        return;
      }

      setTrip(data);
      setLocation(data.location || "");
      setStartDate(new Date(data.trip_start_date));
      setEndDate(new Date(data.trip_end_date));
      setDuration(data.trip_duration || null);
      setBudget(data.budget || null);
      setNote(data.note || "");
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  // Auto calculate duration
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays > 0 ? diffDays : null);
    }
  }, [startDate, endDate]);

  // Update trip
  const handleUpdateTrip = async () => {
    if (!location || !startDate || !endDate) {
      toast.current?.show({
        severity: "warn",
        summary: "Missing Info",
        detail: "Please fill in all required fields.",
        life: 3000,
      });
      return;
    }

    const { data, error, status } = await supabase
      .from("trips")
      .update({
        location,
        trip_start_date: startDate.toISOString(),
        trip_end_date: endDate.toISOString(),
        trip_duration: duration,
        budget: budget || 0,
        note : note,
        modify_at: new Date().toISOString(),
        modify_by: userName 
      })
      .eq("trip_id", tripId).select(); 

    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update trip.",
        life: 4000,
      });
      return;
    }

    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Trip updated successfully!",
      life: 2000,
    });

    setTimeout(() => {
      router.push(`/plans/${tripId}`); // Go back to overview
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateTrip();
  };

  if (!trip) {
    return (
      <div className="flex justify-center items-center min-h-screen  ">
        Loading trip details...
      </div>
    );
  }

  return (
    <main className="min-h-screen   p-8">
      <Toast ref={toast} />

      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 " />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">✏️ Edit Trip</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md mx-auto bg-brown-700 p-6 rounded-lg shadow-lg"
      >
        <div>
          <label className="block text-sm mb-2">Trip Location</label>
          <InputText
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="component-style"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Start Date</label>
          <Calendar
            value={startDate}
            onChange={(e) => setStartDate(e.value as Date)}
            required
            showIcon
            className="component-style"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">End Date</label>
          <Calendar
            value={endDate}
            onChange={(e) => setEndDate(e.value as Date)}
            required
            showIcon
            className="component-style"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Budget</label>
          <InputNumber
            value={budget}
            onValueChange={(e) => setBudget(e.value as number)}
            mode="currency"
            currency="USD"
            locale="en-US"
            showButtons
            className="component-style"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Note</label>
          <InputTextarea
            value={note ?? ""}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter a note (Optional)"
            className="component-style"
            rows={4}
            autoResize
          />
        </div>

       <div className="flex justify-center mt-6">
        <button type="submit" className="green-button-style">
          💾 Save Changes
        </button>
       </div>
      </form>
    </main>
  );
}
