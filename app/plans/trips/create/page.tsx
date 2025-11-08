"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Image } from "primereact/image";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { supabase } from "../../../../lib/supbabaseClient";
import { useUserName, useUserId } from "../../../../lib/userUtils";
import {v4 as uuidv4} from 'uuid';

export default function TripPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const toast = useRef<Toast>(null);
  const userName = useUserName();
  const userId = useUserId();

  // Automatically calculate duration whenever startDate or endDate changes
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays > 0 ? diffDays : null);
    } else {
      setDuration(null);
    }
  }, [startDate, endDate]);

  // 🖼 Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // 🚀 Create trip
  const handleCreateTrip = async () => {
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

    let imageUrl: string | null = null;

// 🧷 Upload image to Supabase Storage (traveling-management)
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
      detail: "Could not upload image to database.",
      life: 4000,
    });
    return;
  } else {
    const { data: publicUrlData } = supabase.storage
      .from("traveling-management")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData?.publicUrl || null;
  }
}

    // 1️⃣ Insert trip data
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .insert({
        location,
        trip_start_date: startDate.toISOString(),
        trip_end_date: endDate.toISOString(),
        trip_duration: duration,
        budget: budget || 0,
        note: note,
        created_at: new Date().toISOString(),
        created_by: userName,
        user_id: userId,
        image_url: imageUrl, 
      })
      .select()
      .single();

    if (tripError) {
      console.error("Error creating trip:", tripError.message);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create trip. Try again.",
        life: 4000,
      });
      return;
    }

    // 2️⃣ Link user to trip
    const { error: tripUserError } = await supabase.from("trip_users").insert({
      trip_id: tripData.trip_id,
      user_id: userId,
    });

    if (tripUserError) {
      console.error("Error linking user:", tripUserError.message);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to link user to trip.",
        life: 4000,
      });
      return;
    }

    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Trip created successfully!",
      life: 2000,
    });

    setTimeout(() => {
      router.push("/plans");
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateTrip();
  };

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

      <h1 className="text-2xl font-bold mb-6 text-center">➕ Add New Trip</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md mx-auto bg-brown-700 p-6 rounded-lg shadow-lg"
      >
        {/* Trip Location */}
        <div>
          <label className="block text-sm mb-2 font-bold">Trip Location</label>
          <InputText
            type="text"
            placeholder="Enter location"
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
            className="component-style"
            inputId="currency-us"
            value={budget}
            onValueChange={(e) => setBudget(e.value as number)}
            mode="currency"
            currency="USD"
            locale="en-US"
            showButtons
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm mb-2 font-bold">Note</label>
          <InputTextarea
            placeholder="Enter a note (Optional)"
            onChange={(e) => setNote(e.target.value)}
            className="component-style"
            rows={4}
            autoResize
          />
        </div>

        {/* 🖼 Image Upload */}
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
                {preview && (
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
                )}
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

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button type="submit" className="green-button-style">
            Create Trip
          </button>
        </div>
      </form>
    </main>
  );
}
