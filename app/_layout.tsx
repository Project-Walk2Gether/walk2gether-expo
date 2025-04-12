import { Stack } from "expo-router";
import React from "react";
import { TamaguiProvider } from "tamagui";
import "../config/emulators";
import { WithAuthProvider } from "../context/AuthContext";
import { FlashMessageProvider } from "../context/FlashMessageContext";
import { UpdatesProvider } from "../context/UpdatesContext";
import { useAppStateUpdates } from "../hooks/useAppStateUpdates";
import { tamaguiConfig } from "../tamagui.config";

// https://github.com/FaridSafi/react-native-google-places-autocomplete#more-examples
(navigator as any).geolocation = require("@react-native-community/geolocation");

function AppContent() {
  // Use our custom hook to handle app state updates
  useAppStateUpdates();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <FlashMessageProvider>
        <UpdatesProvider>
          <AppContent />
        </UpdatesProvider>
      </FlashMessageProvider>
    </TamaguiProvider>
  );
}

// Export the RootLayout wrapped with the AuthProvider
export default WithAuthProvider(RootLayout);
