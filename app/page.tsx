"use client";

import { useSupabaseSession } from "./components/SupabaseProvider";
import MainPage from "./components/MainPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

export default function Home() {
  const { session } = useSupabaseSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  if (session === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center  ">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="8"
          fill="var(--surface-ground)"
          animationDuration=".5s"
        />
      </main>
    );
  }

  return <MainPage />;
}
