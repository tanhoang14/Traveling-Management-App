import { useSupabaseSession } from "../app/components/SupabaseProvider";

// Custom hook: logged-in user's name
export function useUserName() {
  const { session } = useSupabaseSession();
  return session?.user?.user_metadata?.full_name || null;
}

export function useUserId() {
  const { session } = useSupabaseSession();
  return session?.user?.id || null;
}

// Custom hook: logged-in user's email
export function useUserEmail() {
  const { session } = useSupabaseSession();
  return session?.user?.email || null;
}

// Custom hook: logged-in user object
export function useCurrentUser() {
  const { session } = useSupabaseSession();
  return session?.user || null;
}
