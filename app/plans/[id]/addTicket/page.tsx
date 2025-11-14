"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supbabaseClient";
import { ArrowLeft } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

export default function NewTicketPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useRef<Toast>(null);

  // Get all available time zones
  const timeZones = useMemo(
    () =>
      Intl.supportedValuesOf("timeZone").map((tz) => ({
        label: tz,
        value: tz,
      })),
    []
  );

  const [airline, setAirline] = useState("");
  const [passenger, setPassenger] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [gate, setGate] = useState("");
  const [seat, setSeat] = useState("");
  const [boardingTime, setBoardingTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!airline || !fromLocation || !toLocation || !flightNumber || !date) {
      toast.current?.show({
        severity: "warn",
        className:'bg-brown-600',
        summary: "Missing required fields",
        detail: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("tickets").insert([
      {
        trip_id: id,
        airline,
        passenger,
        from_location: fromLocation,
        to_location: toLocation,
        from_airport: fromAirport,
        to_airport: toAirport,
        flight_number: flightNumber,
        gate,
        seat,
        boarding_time: boardingTime || null,
        arrival_time: arrivalTime || null,
        date: date.toISOString().split("T")[0],
        time_zone: timeZone,
      },
    ]);

    if (error) {
      console.error("Error saving ticket:", error);
      toast.current?.show({
        severity: "error",
        className:'bg-brown-600',
        summary: "Failed to save ticket",
      });
    } else {
      toast.current?.show({
        severity: "success",
        className:'bg-brown-600',
        summary: "Ticket added!",
      });
      setTimeout(() => router.push(`/plans/${id}/tickets`), 1000);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen px-6 pb-24">
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex items-center mb-6 mt-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">✈️ Add New Ticket</h1>

      {/* Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-300">
        <div className="flex flex-col gap-4">
          {/* Airline */}
          <div>
            <label
              htmlFor="airline"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Airline
            </label>
            <InputText
              id="airline"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Passenger Name */}
          <div>
            <label
              htmlFor="passenger"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Passenger Name
            </label>
            <InputText
              id="passenger"
              value={passenger}
              onChange={(e) => setPassenger(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* From */}
          <div>
            <label
              htmlFor="from"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              From (e.g. LAX)
            </label>
            <InputText
              id="from"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* To */}
          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              To (e.g. JFK)
            </label>
            <InputText
              id="to"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

            <div className="grid grid-cols-2 gap-4">
            {/* From Airport */}
            <div>
              <label
                htmlFor="fromAirport"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                From Airport
              </label>
              <InputText
                id="fromAirport"
                value={fromAirport}
                onChange={(e) =>
                  setFromAirport(e.target.value.toUpperCase().slice(0, 3))
                }
                placeholder="LAX"
                maxLength={3}
                className="w-full border border-gray-400 rounded-md"
              />
            </div>

            {/* To Airport */}
            <div>
              <label
                htmlFor="toAirport"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                To Airport
              </label>
              <InputText
                id="toAirport"
                value={toAirport}
                onChange={(e) =>
                  setToAirport(e.target.value.toUpperCase().slice(0, 3))
                }
                placeholder="JFK"
                maxLength={3}
                className="w-full border border-gray-400 rounded-md"
              />
            </div>
          </div>

          {/* Flight Number */}
          <div>
            <label
              htmlFor="flightNumber"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Flight Number
            </label>
            <InputText
              id="flightNumber"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Gate */}
          <div>
            <label
              htmlFor="gate"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Gate (optional)
            </label>
            <InputText
              id="gate"
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Seat */}
          <div>
            <label
              htmlFor="seat"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Seat (optional)
            </label>
            <InputText
              id="seat"
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Flight Date
            </label>
            <Calendar
              id="date"
              value={date}
              onChange={(e) => setDate(e.value as Date)}
              showIcon
              dateFormat="yy-mm-dd"
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Boarding Time */}
          <div>
            <label
              htmlFor="boardingTime"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Boarding Time
            </label>
            <input
              id="boardingTime"
              type="time"
              value={boardingTime}
              onChange={(e) => setBoardingTime(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded-md"
            />
          </div>

          {/* Arrival Time */}
          <div>
            <label
              htmlFor="arrivalTime"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Arrival Time
            </label>
            <input
              id="arrivalTime"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded-md"
            />
          </div>

          {/* Time Zone */}
          <div>
            <label
              htmlFor="timeZone"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Time Zone
            </label>
            <Dropdown
              id="timeZone"
              value={timeZone}
              options={timeZones}
              onChange={(e) => setTimeZone(e.value)}
              placeholder="Select Time Zone"
              filter
              showClear={false}
              panelClassName="bg-brown-700 border border-gray-700 shadow-lg"
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Save Button */}
          <button
            disabled={loading}
            onClick={handleSave}
            className={`mt-4 w-full text-white py-2 rounded-lg font-semibold ${
              loading ? "bg-gray-500" : "bg-yellow-600 hover:bg-yellow-700"
            } transition-colors`}
          >
            {loading ? "Saving..." : "Save Ticket"}
          </button>
        </div>
      </div>
    </main>
  );
}
