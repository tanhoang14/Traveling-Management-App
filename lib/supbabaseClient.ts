// lib/supbabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Hybrid storage that checks both localStorage and cookies
const hybridStorage = {
  getItem: (key: string) => {
    try {
      // First check localStorage (where Supabase usually stores it)
      if (typeof window !== "undefined" && window.localStorage) {
        const fromLocalStorage = localStorage.getItem(key);
        if (fromLocalStorage) {
          return fromLocalStorage;
        }
      }

      // Then check cookies (for backward compatibility)
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
          const [cookieKey, cookieValue] = cookie.trim().split("=");
          if (cookieKey === key) {
            return decodeURIComponent(cookieValue);
          }
        }
      }
      return null;
    } catch (error) {
      console.warn("Storage access error:", error);
      return null;
    }
  },

  setItem: (key: string, value: string) => {
    try {
      // Store in localStorage (primary)
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
      }

      // Also store in cookies (backup)
      if (typeof document !== "undefined") {
        const date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        document.cookie = `${key}=${encodeURIComponent(
          value
        )}; expires=${date.toUTCString()}; path=/; SameSite=Lax${
          window.location.protocol === "https:" ? "; Secure" : ""
        }`;
      }
    } catch (error) {
      console.warn("Storage set error:", error);
    }
  },

  removeItem: (key: string) => {
    try {
      // Remove from localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(key);
      }

      // Remove from cookies
      if (typeof document !== "undefined") {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    } catch (error) {
      console.warn("Storage remove error:", error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: hybridStorage,
  },
});
