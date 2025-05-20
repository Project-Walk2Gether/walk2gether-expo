import { useAuth } from "@/context/AuthContext";
import { FriendsProvider } from "@/context/FriendsContext";
import { LocationProvider } from "@/context/LocationContext";
import { MenuProvider } from "@/context/MenuContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { useWalks, WalksProvider } from "@/context/WalksContext";
import { syncBackgroundLocationTracking } from "@/utils/locationSyncTask";
import { Redirect, Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

function MainAppLayout() {
  const { activeWalks } = useWalks();

  // Sync background location tracking with active walks
  useEffect(() => {
    syncBackgroundLocationTracking(activeWalks.length);
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
    <LocationProvider>
      <UserDataProvider>
        <MenuProvider>
          <NotificationsProvider>
            <WalksProvider>
              <FriendsProvider>
                <MainAppLayout />
              </FriendsProvider>
            </WalksProvider>
          </NotificationsProvider>
        </MenuProvider>
      </UserDataProvider>
    </LocationProvider>
  );
}
