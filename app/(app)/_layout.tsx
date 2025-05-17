import { useAuth } from "@/context/AuthContext";
import { FriendsProvider } from "@/context/FriendsContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { useWalks, WalksProvider } from "@/context/WalksContext";
import { syncBackgroundLocationTracking } from "@/utils/locationSyncTask";
import { Redirect, Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

function MainAppLayout() {
  const { user } = useAuth();
  const { activeWalks } = useWalks();

  // Sync background location tracking with active walks
  useEffect(() => {
    const runSyncTask = async () => {
      await syncBackgroundLocationTracking(activeWalks.length);
    };

    // Run the sync task when component mounts and when active walks change
    runSyncTask();
  }, [activeWalks]);

  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
    </Stack>
  );
}

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
          <MainAppLayout />
        </FriendsProvider>
      </WalksProvider>
    </NotificationsProvider>
  );
}
