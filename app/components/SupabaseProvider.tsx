"use client";

import { supabase } from "../../lib/supbabaseClient";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type SupabaseContextType = {
  session: Session | null | undefined; 
};

const SupabaseContext = createContext<SupabaseContextType>({
  session: undefined,
});

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getInitialSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseSession = () => useContext(SupabaseContext);
