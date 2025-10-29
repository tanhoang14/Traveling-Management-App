export const formatTime = (t: any): string | null => {
  if (!t) return null;

  // If it's already in HH:mm format, return it as-is
  if (typeof t === "string" && /^\d{2}:\d{2} [AP]M$/.test(t)) {
    return t; // Return the valid "HH:mm" string
  }

  let dateObj: Date;

  if (typeof t === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
    const [h, m] = t.split(":").map(Number);
    const hours = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hours}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  dateObj = new Date(t);
  if (isNaN(dateObj.getTime())) return null;

  const hours = dateObj.getHours() % 12 || 12;
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${ampm}`;
};

// converterMethod.ts
export function toDateFromTimeString(
  timeStr: string | null | undefined
): Date | null {
  if (!timeStr) return null;

  const [time, modifier] = timeStr.split(" ");
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ✅ Helper functions
export function formatUTCDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
  });
}

export function getTripDayUTC(startDateStr: string, dayOffset: number): string {
  if (!startDateStr) return "";
  const date = new Date(`${startDateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (dayOffset - 1));
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}
