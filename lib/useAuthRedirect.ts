import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseSession } from "../app/components/SupabaseProvider";

export function useAuthRedirect(redirectPath = "/login") {
  const { session } = useSupabaseSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      router.push(redirectPath);
    }
  }, [session, router, redirectPath]);

  return { session, isAuthenticated: session !== null };
}
