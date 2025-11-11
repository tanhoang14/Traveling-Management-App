"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supbabaseClient";
import { ProgressSpinner } from "primereact/progressspinner";
import { ArrowLeft, FileEditIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { formatUTCDate } from "@/lib/converterMethod";

export default function TripTicketsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [groupedTickets, setGroupedTickets] = useState<{[key: string]: any[]}>({});
  const [flightGroups, setFlightGroups] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("trip_id", id)
        .order("date", { ascending: true })
        .order("flight_number", { ascending: true });

      if (error) {
        console.error(error);
        setTickets([]);
      } else {
        setTickets(data);
        groupTicketsByFlightAndDate(data);
      }

      setLoading(false);
    };

    fetchTickets();
  }, [id]);

  const groupTicketsByFlightAndDate = (tickets: any[]) => {
    const grouped: {[key: string]: any[]} = {};
    
    tickets.forEach(ticket => {
      const key = `${ticket.flight_number}-${ticket.date}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(ticket);
    });

    setGroupedTickets(grouped);
    
    // Convert to array for pagination
    const groupsArray = Object.keys(grouped).map(key => ({
      key,
      flightNumber: grouped[key][0].flight_number,
      date: grouped[key][0].date,
      tickets: grouped[key]
    }));
    
    setFlightGroups(groupsArray);
  };

  const nextPage = () => {
    if (currentPage < flightGroups.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (index: number) => {
    setCurrentPage(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  const currentFlightGroup = flightGroups[currentPage];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center mb-6 mt-4">
        <button
          onClick={() => router.push(`/plans/${id}`)}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">🎟️ Trip Tickets</h1>

      {flightGroups.length === 0 ? (
        <div className="text-center text-gray-500">No tickets found.</div>
      ) : (
        <>
          {/* Flight Group Header */}
          {currentFlightGroup && (
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Flight {currentFlightGroup.flightNumber}
              </h2>
              <p className="text-gray-600">
                {formatUTCDate(currentFlightGroup.date)} • 
                {currentFlightGroup.tickets.length} ticket{currentFlightGroup.tickets.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {flightGroups.length > 1 && (
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className={`p-2 rounded-full ${
                  currentPage === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-brown-700 hover:bg-gray-700'
                } transition-colors`}
              >
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>

              <div className="flex space-x-2">
                {flightGroups.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentPage === index 
                        ? 'bg-brown-700' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === flightGroups.length - 1}
                className={`p-2 rounded-full ${
                  currentPage === flightGroups.length - 1 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-brown-700 hover:bg-gray-700'
                } transition-colors`}
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            </div>
          )}

          {/* Tickets for Current Flight Group */}
          <div className="space-y-4">
            {currentFlightGroup?.tickets.map((ticket: any) => (
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

                    <div className="flex flex-col items-center text-gray-800">
                      {/* From - To locations */}
                      <div className="flex items-center gap-4 text-2xl font-semibold">
                        <span className="text-nowrap">{ticket.from_location}</span>
                        <span className="text-gray-400 text-lg">-</span>
                        <span className="text-nowrap">{ticket.to_location}</span>
                      </div>

                      {/* From - To airport codes */}
                      <div className="flex justify-between w-40 mt-1 text-gray-400 text-xs" style={{ width: "65%" }}>
                        <span className="text-center">{ticket.from_airport}</span>
                        <span className="text-center">{ticket.to_airport}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-1 text-xs text-gray-500">
                    <p>
                      Flight:{" "}
                      <span className="font-semibold text-gray-700">
                        {ticket.flight_number}
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
            ))}
          </div>
        </>
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