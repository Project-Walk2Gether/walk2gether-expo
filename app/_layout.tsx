import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { TamaguiProvider } from "tamagui";
import "../config/emulators";
import { WithAuthProvider } from "../context/AuthContext";
import { FlashMessageProvider } from "../context/FlashMessageContext";
import { LocationProvider } from "../context/LocationContext";
import { UpdatesProvider } from "../context/UpdatesContext";
import { UserDataProvider } from "../context/UserDataContext";
import { useAppStateUpdates } from "../hooks/useAppStateUpdates";
import { tamaguiConfig } from "../tamagui.config";

// Import background location task registration
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../components/ErrorBoundary";
import { registerBackgroundTask } from "../utils/backgroundLocationTask";

// https://github.com/FaridSafi/react-native-google-places-autocomplete#more-examples
(navigator as any).geolocation = require("@react-native-community/geolocation");

function AppContent() {
  // Use our custom hook to handle app state updates
  useAppStateUpdates();

  // Register background location task when the app starts
  useEffect(() => {
    registerBackgroundTask();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(app)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="join" options={{ 
            headerShown: false,
            animation: "none",
          }} />
          <Stack.Screen name="auth" options={{ 
            headerShown: false,
            animation: "none",
          }} />
        </Stack>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function RootLayout() {
  return (
    <LocationProvider>
      <TamaguiProvider config={tamaguiConfig}>
        <FlashMessageProvider>
          <UpdatesProvider>
            <UserDataProvider>
              <AppContent />
            </UserDataProvider>
          </UpdatesProvider>
        </FlashMessageProvider>
      </TamaguiProvider>
    </LocationProvider>
  );
}

// Export the RootLayout wrapped with the AuthProvider
export default WithAuthProvider(RootLayout);
