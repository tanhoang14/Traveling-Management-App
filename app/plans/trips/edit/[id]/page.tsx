"use client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ImageUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import { supabase } from "@/lib/supbabaseClient";
import { useUserName, useUserId } from "@/lib/userUtils";
import { v4 as uuidv4 } from "uuid";
import NoteAppEditor from "@/app/components/NoteAppEditor";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const toast = useRef<Toast>(null);
  const userName = useUserName();
  const userId = useUserId();

  // Fetch trip
  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid Trip",
          detail: "Trip ID missing from URL.",
          life: 4000,
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("trip_id", tripId)
        .single();

      if (error || !data) {
        console.error("Error fetching trip:", error?.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch trip data.",
          life: 4000,
        });
        setLoading(false);
        return;
      }

      setTrip(data);
      setLocation(data.location || "");
      setStartDate(data.trip_start_date ? new Date(data.trip_start_date) : null);
      setEndDate(data.trip_end_date ? new Date(data.trip_end_date) : null);
      setDuration(data.trip_duration || null);
      setBudget(data.budget || null);
      setNote(data.note || "");
      setPreview(data.image_url || null);
      setLoading(false);
    };

    fetchTrip();
  }, [tripId]);

  // Auto calculate duration
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays > 0 ? diffDays : null);
    }
  }, [startDate, endDate]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

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

    if (duration === null || duration <= 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Invalid Dates",
        detail: "End Date must be after Start Date.",
        life: 3000,
      });
      return;
    }

    let imageUrl = preview; // keep old image if no new file

    // Upload new image if selected
    if (imageFile) {
      const filePath = `trip-images/${userId}/${uuidv4()}`;
      const { error: uploadError } = await supabase.storage
        .from("traveling-management")
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        toast.current?.show({
          severity: "error",
          summary: "Upload Failed",
          detail: "Could not upload image.",
          life: 4000,
        });
        return; // cancel update if image upload fails
      }

      const { data: publicUrlData } = supabase.storage
        .from("traveling-management")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData?.publicUrl || null;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        location,
        trip_start_date: startDate.toISOString(),
        trip_end_date: endDate.toISOString(),
        trip_duration: duration,
        budget: budget || 0,
        note,
        modify_at: new Date().toISOString(),
        modify_by: userName,
        image_url: imageUrl,
      })
      .eq("trip_id", tripId);

    if (error) {
      console.error("Update error:", error.message);
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
      router.push(`/plans/${tripId}`);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateTrip();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading trip details...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <Toast ref={toast} />
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">✏️ Edit Trip</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md mx-auto bg-brown-700 p-6 rounded-lg shadow-lg"
      >
        {/* Location */}
        <div>
          <label className="block text-sm mb-2 font-bold">Trip Location</label>
          <InputText
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="component-style"
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm mb-2 font-bold">Start Date</label>
          <Calendar
            value={startDate}
            onChange={(e) => setStartDate(e.value as Date)}
            required
            showIcon
            className="component-style"
          />
        </div>
        <div>
          <label className="block text-sm mb-2 font-bold">End Date</label>
          <Calendar
            value={endDate}
            onChange={(e) => setEndDate(e.value as Date)}
            required
            showIcon
            className="component-style"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm mb-2 font-bold">Budget</label>
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

        {/* Note */}
        <div>
          <label className="block text-sm mb-2 font-bold">Note</label>
          <NoteAppEditor
              content={note ?? ""}
              onUpdate={(htmlContent) => setNote(htmlContent)}
            />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-2 font-bold">Trip Image</label>
          <div
            className="border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:border-[#4f9da6] transition"
            onClick={() => document.getElementById("tripImageInput")?.click()}
          >
            {!preview ? (
              <>
                <ImageUp className="w-10 h-10 text-black mb-2" />
                <p className="text-black text-sm">Click to upload image</p>
              </>
            ) : (
              <div className="w-full">
                <Image
                  src={preview}
                  alt="Trip Preview"
                  preview
                  imageClassName="rounded-lg object-cover w-full h-40"
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setPreview(null);
                  }}
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <input
            id="tripImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
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
