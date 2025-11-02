"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supbabaseClient";
import { Dropdown } from "primereact/dropdown";
import { ArrowLeft } from "lucide-react";
import { Trip } from "../types/activity";
import { ProgressSpinner } from "primereact/progressspinner";
import { useUserId } from "@/lib/userUtils";
import { CategoryData } from "../types/activity";

const COLORS = ["#00C9A7", "#FF6B6B", "#4D96FF", "#F6BE00", "#9B5DE5"];

export default function InsightPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = useUserId();

  // Fetch trips for this user
  useEffect(() => {
    if (!userId) return;

    const fetchTrips = async () => {
       const { data, error } = await supabase
        .from("trip_users")
        .select(`
          trip_id,
          trips (
            trip_id,
            location,
            trip_start_date,
            trip_end_date,
            trip_duration,
            budget
          )
        `)
        .eq("user_id", userId ) 
        .order("created_at", { ascending: false });
      
      if(data){
      // ✅ Flatten nested "trips" object
      const flattenedTrips = data
        .map((item: any) => item.trips)
        .filter((t: any) => t !== null);

      setTrips(flattenedTrips as Trip[]);
      }

      if (error) console.error("Error fetching trips:", error);      
    };

    fetchTrips();
  }, [userId]);

  // Fetch insights for selected trip
  useEffect(() => {
    if (!selectedTrip) return;

    const fetchInsights = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("activities")
        .select(`
          cost,
          activity_category(category_name),
          days!inner(trip_id)
        `)
        .eq("days.trip_id", selectedTrip);

      if (error) {
        console.error("Error fetching insights:", error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }

      // Group spending by category
      const categoryTotals: Record<string, number> = {};
      data.forEach((item: any) => {
        const costValue = Number(item.cost) || 0;
        const name = item.activity_category?.category_name || "Uncategorized";
        categoryTotals[name] = (categoryTotals[name] || 0) + costValue;
      });

      // Format for Recharts
      const formatted = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
      }));

      setChartData(formatted);
      setLoading(false);
    };

    fetchInsights();
  }, [selectedTrip]);

  return (
    <main className="min-h-screen text-white p-6 sm:p-10">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">📊 Spending Insights</h1>

      {/* Trip Selection */}
      <div className="flex justify-center mb-8">
        <Dropdown
          value={selectedTrip}
          options={trips.map((trip) => ({
            label: trip.location,
            value: trip.trip_id,
          }))}
          onChange={(e) => setSelectedTrip(e.value)}
          placeholder="Select a trip"
          className="w-72 text-black"
        />
      </div>

      {/* Chart Display */}
      {loading ? (
        <div className="flex justify-center items-center h-80">
          <ProgressSpinner />
        </div>
      ) : selectedTrip && chartData.length > 0 ? (
        <div className="w-full h-96 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : selectedTrip ? (
        <p className="text-center text-gray-400 text-lg hidden">No spending data for this trip.</p>
      ) : (
        <p className="text-center text-gray-400 text-lg mt-5 hidden">Select a trip to view insights.</p>
      )}
    </main>
  );
}
