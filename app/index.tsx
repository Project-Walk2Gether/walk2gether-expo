import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";
import { useAuth } from "../context/AuthContext";

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Redirect href="/home/active" />;
  if (!loading && !user) return <Redirect href="/auth" />;

  // Show loading indicator while checking auth state
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
