import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useUpdates } from "../context/UpdatesContext";

/**
 * Custom hook that checks for updates when the app opens
 * and monitors app state changes (background/foreground)
 */
export const useAppStateUpdates = () => {
  const { checkForUpdate } = useUpdates();

  useEffect(() => {
    // Check for updates when the app opens
    checkForUpdate();

    // Set up app state monitoring
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App has come back to the foreground
        console.log("App has come back to the foreground");
        // The UpdatesContext already handles foreground/background transitions
        // so we don't need to call checkForUpdate here
      } else if (nextAppState.match(/inactive|background/)) {
        // App has moved to the background
        console.log("App has moved to the background");
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);
};
