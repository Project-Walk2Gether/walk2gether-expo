import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/**
 * Hook that redirects to the main app if the user is already signed in
 */
export function useRedirectIfSignedIn() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've finished loading the auth state and have a user
    if (!loading && user) {
      console.log("User already signed in, redirecting to main app");
      router.replace("/(app)");
    }
  }, [user, loading, router]);

  return null;
}
