"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const data = [
  { name: "Food", value: 400 },
  { name: "Hotel", value: 700 },
  { name: "Transport", value: 300 },
  { name: "Entertainment", value: 200 },
  { name: "Others", value: 150 },
];

const COLORS = ["#00C9A7", "#FF6B6B", "#4D96FF", "#FFD93D", "#9B5DE5"];

export default function InsightPage() {
    const router = useRouter();
  return (
    <main className="min-h-screen   p-8">
    <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 " />
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">📊 Spending Insights</h1>

      <div className="w-full h-96 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
