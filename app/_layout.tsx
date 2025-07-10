import { withErrorBoundary } from "@/components/ErrorBoundary";
import { withAuthProvider } from "@/context/AuthContext";
import { withFlashMessage } from "@/context/FlashMessageProvider";
import { withGestureHandler } from "@/context/GestureHandlerProvider";
import { withSheetProvider } from "@/context/SheetProvider";
import { withTamagui } from "@/context/TamaguiProvider";
import { withUpdates } from "@/context/UpdatesContext";
import { useAppStateUpdates } from "@/hooks/useAppStateUpdates";
import { configureNotifications } from "@/utils/notifications";
import { Stack } from "expo-router";
import flowRight from "lodash/flowRight";
import React from "react";
import "react-native-get-random-values";
import "../config/emulators";

// https://github.com/FaridSafi/react-native-google-places-autocomplete#more-examples
(navigator as any).geolocation = require("@react-native-community/geolocation");

// Configure notifications at the app initialization
configureNotifications();

/**
 * Main App component that wraps the entire application
 */
function App() {
  // Use our custom hook to handle app state updates (includes update checking)
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
  );
}

/**
 * Compose all HOCs into a single enhancer function
 * This creates a wrapped component with all providers in the correct order:
 * - withTamagui (outermost) - UI theme provider
 * - withFlashMessage - Flash messages
 * - withErrorBoundary - Error handling
 * - withGestureHandler - Gesture handler root view (required for bottom sheets)
 * - withSheetProvider - Sheet UI components
 * - withUpdates - OTA updates
 * - withAuthProvider (innermost) - Authentication
 */
const enhance = flowRight(
  withTamagui,
  withFlashMessage,
  withErrorBoundary,
  withGestureHandler,
  withSheetProvider,
  withUpdates,
  withAuthProvider
);

// Export the App component wrapped with all providers
export default enhance(App);
