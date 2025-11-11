"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supbabaseClient";
import { ProgressSpinner } from "primereact/progressspinner";
import { ArrowLeft, FileEditIcon, Plus } from "lucide-react";

export default function TripTicketsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("trip_id", id);

      if (error) {
        console.error(error);
        setTickets([]);
      } else {
        setTickets(data);
      }

      setLoading(false);
    };

    fetchTickets();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center mb-6 mt-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">🎟️ Trip Tickets</h1>

      {tickets.length === 0 ? (
        <div className="text-center text-gray-500">No tickets found.</div>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.ticket_id}
            className="relative flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl shadow-md overflow-hidden max-w-md mx-auto border border-amber-300"
          >
            {/* Left Section */}
            <div className="flex-1 bg-white h-full p-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">
                    {ticket.airline}
                  </h2>
                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        router.push(
                          `/plans/${id}/tickets/editTicket/${ticket.ticket_id}`
                        )
                      }
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <FileEditIcon className="inline-block w-4 h-4 mr-1 text-black" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-500 text-xs mb-3">
                  Passenger:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.passenger}
                  </span>
                </p>

                <div
                  className="flex items-center gap-2 text-2xl font-semibold text-gray-800"
                  style={{ flexDirection: "column" }}
                >
                  <div className="flex flex-direction-row gap-4 items-center">
                    <span>{ticket.from_location}</span>
                    <span className="text-gray-400 text-lg">-</span>
                    <span>{ticket.to_location}</span>
                  </div>
                  <div className="flex flex-direction-row gap-6 items-center">
                    <small className="flex justify-center text-gray-400 text-xs">
                      {ticket.from_airport}
                    </small>
                    <small className="flex justify-center text-gray-400 text-xs">
                      {ticket.to_airport}
                    </small>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 text-xs text-gray-500">
                <p>
                  Flight:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.flight}
                  </span>
                </p>
                <p>
                  Date:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.date}
                  </span>
                </p>
                <p>
                  Gate:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.gate}
                  </span>
                </p>
                <p>
                  Boarding:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.boarding_time}
                  </span>
                </p>
                <p>
                  Seat:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.seat}
                  </span>
                </p>
                <p>
                  Arrival:{" "}
                  <span className="font-semibold text-gray-700">
                    {ticket.arrival_time}
                  </span>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] h-28 border-l-2 border-dashed border-amber-300"></div>

            {/* Right Section */}
            <div className="bg-amber-300 sm:w-32 w-full p-3 flex flex-col items-center justify-center relative">
              <p className="font-bold text-gray-800 text-xs mb-1">
                Boarding Pass
              </p>
              <div className="bg-gray-800 h-8 w-20 rounded-md overflow-hidden flex justify-center items-center">
                <div className="h-6 w-16 bg-[repeating-linear-gradient(90deg,_#fff_0px,_#fff_2px,_#000_2px,_#000_4px)]"></div>
              </div>
            </div>
          </div>
        ))
      )}
      <div className="flex justify-center">
        <button
          onClick={() => router.push(`/plans/${id}/addTicket`)}
          className="mt-4 px-4 py-2 bg-brown-700 text-black rounded hover:bg-gray-800 transition"
        >
          <Plus className="inline-block mr-2 w-4 h-4" />
          Add Ticket
        </button>
      </div>
    </div>
  );
}
