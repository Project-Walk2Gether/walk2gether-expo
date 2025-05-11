import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { determineUserRoute, getUserDisplayName, RouteResult } from "@/utils/navigation";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

export default function IndexScreen() {
  const { user, loading, claims } = useAuth();
  const { showMessage } = useFlashMessage();
  const [redirectTo, setRedirectTo] = useState<RouteResult | null>(null);

  // Handle navigation logic once user is authenticated
  useEffect(() => {
    const handleNavigation = async () => {
      // Don't proceed if still loading or user is not authenticated
      if (loading || !user) return;
      
      // Use our utility function to determine the right route
      const route = await determineUserRoute(user.uid, { 
        claims: claims || undefined 
      });
      
      // Show welcome message if going to main app
      if (route === "/walks") {
        const displayName = await getUserDisplayName(user.uid);
        showMessage(`Welcome, ${displayName}!`, "success");
      }
      
      // Store the route for redirect
      setRedirectTo(route);
    };
    
    handleNavigation();
  }, [user, loading, claims]);

  // Show loading indicator while loading auth state
  if (loading)
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#f5f5f5"
      >
        <ActivityIndicator size="large" color="#4285F4" />
      </YStack>
    );

  // Handle authentication and routing
  if (!user) {
    return <Redirect href="/auth" />;
  }
  
  // If we have a route to redirect to, do it
  if (redirectTo) {
    // Use type assertion to handle both string and object routes
    return <Redirect href={redirectTo as any} />;
  }
  
  // Show loading indicator while we determine routing
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="#f5f5f5"
    >
      <ActivityIndicator size="large" color="#4285F4" />
    </YStack>
  );
}
