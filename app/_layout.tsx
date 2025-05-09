import { withErrorBoundary } from "@/components/ErrorBoundary";
import { withAuthProvider } from "@/context/AuthContext";
import { FlashMessageProvider } from "@/context/FlashMessageContext";
import { LocationProvider } from "@/context/LocationContext";
import { UpdatesProvider } from "@/context/UpdatesContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { useAppStateUpdates } from "@/hooks/useAppStateUpdates";
import { Stack } from "expo-router";
import React, { ComponentType } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamaguiProvider } from "tamagui";
import "../config/emulators";
import { tamaguiConfig } from "../tamagui.config";

// https://github.com/FaridSafi/react-native-google-places-autocomplete#more-examples
(navigator as any).geolocation = require("@react-native-community/geolocation");

function AppContent() {
  // Use our custom hook to handle app state updates
  useAppStateUpdates();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="join"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

// Higher-Order Component for TamaguiProvider
export const withTamagui = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => (
    <TamaguiProvider config={tamaguiConfig}>
      <Component {...props} />
    </TamaguiProvider>
  );
};

function RootLayout() {
  return (
    <LocationProvider>
      <FlashMessageProvider>
        <UpdatesProvider>
          <UserDataProvider>
            <AppContent />
          </UserDataProvider>
        </UpdatesProvider>
      </FlashMessageProvider>
    </LocationProvider>
  );
}

// Export the RootLayout wrapped with all providers
export default withTamagui(withErrorBoundary(withAuthProvider(RootLayout)));
