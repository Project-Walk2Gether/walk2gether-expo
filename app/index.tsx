import FullScreenLoader from "@/components/FullScreenLoader";
import { useAuth } from "@/context/AuthContext";
import { determineUserRoute, RouteResult } from "@/utils/navigation";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function IndexScreen() {
  const { user, loading, claims } = useAuth();
  const [redirectTo, setRedirectTo] = useState<RouteResult | null>(null);

  // Handle navigation logic once user is authenticated
  useEffect(() => {
    const handleNavigation = async () => {
      // Don't proceed if still loading or user is not authenticated
      if (loading || !user) return;

      // Use our utility function to determine the right route
      const route = await determineUserRoute(user.uid, {
        claims: claims || undefined,
      });

      // Store the route for redirect
      setRedirectTo(route);
    };

    handleNavigation();
  }, [user, loading, claims]);

  // Show loading indicator while loading auth state
  if (loading) return <FullScreenLoader />;

  // Handle authentication and routing
  if (!user) return <Redirect href="/auth" />;

  // If we have a route to redirect to, do it
  if (redirectTo) {
    // Use type assertion to handle both string and object routes
    return <Redirect href={redirectTo as any} />;
  }

  // Show loading indicator while we determine routing
  return <FullScreenLoader />;
}
