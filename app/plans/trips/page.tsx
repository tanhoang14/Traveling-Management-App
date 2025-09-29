"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext"

export default function TripPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Trip:", { location, date });
    router.push("/trips"); // go back after saving
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">➕ Add New Trip</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        {/* Trip Location */}
        <div>
          <label className="block text-sm mb-2">Trip Location</label>
          <InputText
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="component-style"
          />
        </div>

        {/* Trip Date */}
        <div>
          <label className="block text-sm mb-2">Trip Date</label>
          
          <Calendar value={date}
            onChange={(e) => setDate(e.target.value as Date)}
            required 
            showIcon
            className="component-style"/>
        </div>

        {/* Trip Duration */}
        <div>
          <label className="block text-sm mb-2">Trip Duration</label>
          <InputText
            type="number"
            required
            className="component-style"
          />
        </div>

        {/* Budget*/}
        <div>
          <label className="block text-sm mb-2">Budget</label>
          <InputText
            type="text"
            placeholder="Enter a budget(Optional)"
            required
            className="component-style"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="green-button-style">
          ✅ Save Trip
        </button>
      </form>
    </main>
  );
}
