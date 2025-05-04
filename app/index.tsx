import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";
import { useAuth } from "../context/AuthContext";

export default function IndexScreen() {
  const { user, loading, claims } = useAuth();

  // Show loading indicator while checking auth state
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

  if (!user) return <Redirect href="/auth" />;

  if (!claims?.permissionsSet)
    return <Redirect href="/onboarding/notification-permissions" />;

  return <Redirect href="/walks/home" />;
}
