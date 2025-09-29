"use client";

import { useSession } from "next-auth/react";
import MainPage from "./components/MainPage";
import LoginPage from "./components/LoginPage";
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
      </main>
    );
  }

  return session ? <MainPage/> : <LoginPage/>;
}
