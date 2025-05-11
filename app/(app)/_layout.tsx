import { useAuth } from "@/context/AuthContext";
import { FriendsProvider } from "@/context/FriendsContext";
import { WalksProvider } from "@/context/WalksContext";
import { useNotificationPermissions } from "@/hooks/useNotificationPermissions";
import { getAndSyncPushToken } from "@/utils/getAndSyncPushToken";
import { writeLogIfEnabled } from "@/utils/logging";
import { Redirect, Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { permissionStatus } = useNotificationPermissions();

  // Sync push notification token whenever the authenticated layout mounts
  // and permissions are granted
  useEffect(() => {
    if (user && permissionStatus?.granted) {
      // Run silently in background without disrupting navigation
      getAndSyncPushToken().catch((error) => {
        writeLogIfEnabled({
          message: "Failed to sync push token",
          metadata: { error },
        });
      });
    }
  }, [user, permissionStatus]);

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
    <WalksProvider>
      <FriendsProvider>
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
        </Stack>
      </FriendsProvider>
    </WalksProvider>
  );
}
