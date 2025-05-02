import * as Updates from "expo-updates";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { recordError } from "../utils/recordError";
import { appVersion } from "../utils/version";
import { useFlashMessage } from "./FlashMessageContext";

interface UpdatesContextType {
  checkForUpdate: () => Promise<boolean>;
  isCheckingForUpdate: boolean;
  updateAvailable: boolean;
  applyUpdate: () => Promise<void>;
  isApplyingUpdate: boolean;
}

const UpdatesContext = createContext<UpdatesContextType | undefined>(undefined);

export const useUpdates = () => {
  const context = useContext(UpdatesContext);
  if (context === undefined) {
    throw new Error("useUpdates must be used within an UpdatesProvider");
  }
  return context;
};

interface UpdatesProviderProps {
  children: ReactNode;
}

export const UpdatesProvider: React.FC<UpdatesProviderProps> = ({
  children,
}) => {
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const { showMessage } = useFlashMessage();

  // Check if the app was launched with an update
  useEffect(() => {
    const checkInitialUpdate = async () => {
      try {
        if (__DEV__) return;

        if (!Updates.channel || Updates.channel.length === 0) {
          console.log(`Checking for updates (current version: ${appVersion})`);
          const updateStatus = await Updates.checkForUpdateAsync();
          setUpdateAvailable(updateStatus.isAvailable);

          if (updateStatus.isAvailable) {
            console.log("Update available on launch");
          }
        }
      } catch (error) {
        console.error("Error checking for initial update:", error);
        recordError(error, {
          function: "checkInitialUpdate",
          appVersion: appVersion || "unknown",
          context: "UpdatesContext",
        });
      }
    };

    checkInitialUpdate();
  }, []);

  // Check for updates when app comes to foreground
  useEffect(() => {
    if (__DEV__) return;

    // Track time of last update check to prevent too frequent checks
    let lastCheckTime = Date.now();
    const MIN_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Only check if enough time has passed since last check
        const now = Date.now();
        if (now - lastCheckTime > MIN_CHECK_INTERVAL) {
          console.log("App foregrounded - checking for updates");
          await checkForUpdate(true); // silent check
          lastCheckTime = now;
        }
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Clean up
    return () => {
      subscription.remove();
    };
  }, []);

  // Periodic background check for users who keep the app open for extended periods
  useEffect(() => {
    if (__DEV__) return;

    // Check once every 4 hours if app remains open
    const intervalId = setInterval(async () => {
      // Only check if app is in foreground
      if (AppState.currentState === "active") {
        console.log("Performing periodic update check");
        await checkForUpdate(true); // silent check
      }
    }, 4 * 60 * 60 * 1000); // 4 hours

    return () => clearInterval(intervalId);
  }, []);

  // Function to check for updates
  // silent parameter determines whether to show user-facing messages
  const checkForUpdate = async (silent: boolean = false): Promise<boolean> => {
    if (__DEV__) {
      if (!silent)
        showMessage("Updates are disabled in development mode", "info");
      return false;
    }

    try {
      setIsCheckingForUpdate(true);
      console.log(`Checking for updates (current version: ${appVersion})`);
      const update = await Updates.checkForUpdateAsync();

      setUpdateAvailable(update.isAvailable);

      if (update.isAvailable) {
        console.log("Update is available!");
        if (!silent)
          showMessage("Update available! Pull down to apply.", "success");
        return true;
      } else {
        console.log("No updates available");
        if (!silent) showMessage("No updates available", "info");
        return false;
      }
    } catch (error) {
      console.error("Error checking for update:", error);
      recordError(error, {
        function: "checkForUpdate",
        appVersion: appVersion || "unknown",
        context: "UpdatesContext",
      });
      if (!silent) showMessage("Failed to check for updates", "error");
      return false;
    } finally {
      setIsCheckingForUpdate(false);
    }
  };

  // Function to apply the update
  const applyUpdate = async (): Promise<void> => {
    if (__DEV__) {
      showMessage("Updates are disabled in development mode", "info");
      return;
    }

    if (!updateAvailable) {
      showMessage("No update available to apply", "info");
      return;
    }

    try {
      setIsApplyingUpdate(true);
      showMessage("Downloading update...", "info");

      // Fetch the update
      await Updates.fetchUpdateAsync();

      // Show a message before restarting
      showMessage("Update downloaded! Restarting app...", "success");

      // Give the message a moment to be seen
      setTimeout(async () => {
        await Updates.reloadAsync();
      }, 1500);
    } catch (error) {
      console.error("Error applying update:", error);
      showMessage("Failed to apply update", "error");
      setIsApplyingUpdate(false);
    }
  };

  const value = {
    checkForUpdate,
    isCheckingForUpdate,
    updateAvailable,
    applyUpdate,
    isApplyingUpdate,
  };

  return (
    <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>
  );
};
