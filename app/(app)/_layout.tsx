import { useAuth } from "@/context/AuthContext";
import { FriendsProvider } from "@/context/FriendsContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { WalksProvider } from "@/context/WalksContext";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (!user) {
    return <Redirect href="/auth" />;
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
    <NotificationsProvider>
      <WalksProvider>
        <FriendsProvider>
          <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
          </Stack>
        </FriendsProvider>
      </WalksProvider>
    </NotificationsProvider>
  );
}
