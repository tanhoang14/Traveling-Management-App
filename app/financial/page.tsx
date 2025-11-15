"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { ArrowLeft } from "lucide-react";
import { useSupabaseSession } from "../components/SupabaseProvider";

const FinancialPage: React.FC = () => {
  const router = useRouter();
  const { session } = useSupabaseSession();

  const [dailyAmount, setDailyAmount] = useState<number>(10);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [totalSaved, setTotalSaved] = useState<number>(0);

  // 1️⃣ Redirect if user is not logged in
  useEffect(() => {
    if (session === null) {
      router.replace("/login");
    }
  }, [session, router]);

  // Calculate total saved whenever startDate, endDate, or dailyAmount changes
  useEffect(() => {
    if (!startDate || !endDate) {
      setTotalSaved(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      setTotalSaved(0);
      return;
    }

    setTotalSaved(diffDays * dailyAmount);
  }, [startDate, endDate, dailyAmount]);

  return (
    <main className="min-h-screen   p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-brown-700 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 " />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">💰 Financial Planner</h1>

      <div className="max-w-md mx-auto space-y-4">
        {/* Daily Amount */}
        <div>
          <label className="block mb-1">Daily Amount</label>
         <InputNumber className="component-style" 
                      inputId="currency-us" 
                      value={dailyAmount} 
                      onValueChange={(e) => setDailyAmount(e.value as number)} 
                      mode="currency" 
                      currency="USD" 
                      locale="en-US" 
                      showButtons />
        </div>

        {/* Start Date */}
        <div>
          <label className="block mb-1">Start Date</label>
          <Calendar className="component-style" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.value as Date)} 
                    showIcon/>
        </div>

        {/* End Date */}
        <div>
          <label className="block mb-1">End Date</label>
          <Calendar className="component-style" 
                    value={endDate} onChange={(e) => setEndDate(e.value as Date | null)} 
                    showIcon/>
        </div>

        {/* Total Saved (static/read-only) */}
        <div>
          <label className="block mb-1">Total Saved</label>
            <InputNumber className="component-style"
                         inputId="currency-us"
                         value={totalSaved}
                         mode="currency"
                         currency="USD"
                         locale="en-US"/>
        </div>
      </div>
    </main>
  );
};

export default FinancialPage;
