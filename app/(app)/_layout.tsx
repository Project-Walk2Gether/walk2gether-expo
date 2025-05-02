import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { WalksProvider } from "../../context/WalksContext";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  if (!userDataLoading && !userData) {
    console.log("Redirecting");
    return <Redirect href="/onboarding/complete-your-profile" />;
  }

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#f5f5f5"
      >
        <ActivityIndicator size="large" color={"#8AB0A0"} />
      </YStack>
    );
  }

  return (
    <WalksProvider>
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
      </Stack>
    </WalksProvider>
  );
}
