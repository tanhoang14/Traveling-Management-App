"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supbabaseClient";
import { ArrowLeft } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useSupabaseSession } from "../../../../../components/SupabaseProvider";

export default function EditTicketPage() {
  const { id, ticket_id } = useParams(); // id = trip id
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const { session } = useSupabaseSession();
  
    useEffect(() => {
      if (session === null) {
        router.push("/login");
      }
    }, [session, router]);

  // Time zones
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
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [gate, setGate] = useState("");
  const [seat, setSeat] = useState("");
  const [boardingTime, setBoardingTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticket_id) return;
      setFetching(true);
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("ticket_id", ticket_id)
        .single();

      if (error) {
        console.error("Error fetching ticket:", error);
        toast.current?.show({
          severity: "error",
          className:'bg-brown-600',
          summary: "Error",
          detail: "Could not fetch ticket data",
        });
      } else if (data) {
        setAirline(data.airline);
        setPassenger(data.passenger);
        setFromLocation(data.from_location);
        setFromAirport(data.from_airport);
        setToAirport(data.to_airport);
        setToLocation(data.to_location);
        setFlightNumber(data.flight_number);
        setGate(data.gate);
        setSeat(data.seat);
        setBoardingTime(data.boarding_time);
        setArrivalTime(data.arrival_time);
        setDate(data.date ? new Date(data.date) : null);
        setTimeZone(
          data.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      }
      setFetching(false);
    };

    fetchTicket();
  }, [ticket_id]);

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

    const { error } = await supabase
      .from("tickets")
      .update({
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
      })
      .eq("ticket_id", ticket_id);

    if (error) {
      console.error("Error updating ticket:", error);
      toast.current?.show({
        severity: "error",
        className:'bg-brown-600',
        summary: "Failed to update ticket",
      });
    } else {
      toast.current?.show({
        severity: "success",
        className:'bg-brown-600',
        summary: "Ticket updated!",
      });
      setTimeout(() => router.push(`/plans/${id}/tickets`), 1000);
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

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

      <h1 className="text-2xl font-bold mb-6 text-center">✏️ Edit Ticket</h1>

      {/* Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-300">
        <div className="flex flex-col gap-4">
          {/* Airline */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Airline
            </label>
            <InputText
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Passenger */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Passenger Name
            </label>
            <InputText
              value={passenger}
              onChange={(e) => setPassenger(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* From */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              From (e.g. LAX)
            </label>
            <InputText
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              To (e.g. JFK)
            </label>
            <InputText
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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Flight Number
            </label>
            <InputText
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Gate */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Gate (optional)
            </label>
            <InputText
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Seat */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Seat (optional)
            </label>
            <InputText
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Flight Date
            </label>
            <Calendar
              value={date}
              onChange={(e) => setDate(e.value as Date)}
              showIcon
              dateFormat="yy-mm-dd"
              className="w-full border border-gray-400 rounded-md"
            />
          </div>

          {/* Boarding Time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Boarding Time
            </label>
            <input
              type="time"
              value={boardingTime}
              onChange={(e) => setBoardingTime(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded-md"
            />
          </div>

          {/* Arrival Time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Arrival Time
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded-md"
            />
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Time Zone
            </label>
            <Dropdown
              value={timeZone}
              options={timeZones}
              onChange={(e) => setTimeZone(e.value)}
              placeholder="Select Time Zone"
              className="w-full border border-gray-400 rounded-md"
              panelClassName="bg-brown-700 border border-gray-700 shadow-lg"
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
