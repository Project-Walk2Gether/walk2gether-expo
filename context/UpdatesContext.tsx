import { recordError } from "@/utils/recordError";
import { appVersion } from "@/utils/version";
import * as Updates from "expo-updates";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

interface UpdatesContextType {
  checkForUpdate: () => Promise<boolean>;
  isCheckingForUpdate: boolean;
  isUpdateAvailable: boolean;
  applyUpdate: () => Promise<void>;
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
  const [isUpdateAvailable, setUpdateAvailable] = useState(false);

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
          await checkForUpdate();
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

  // Function to check for updates and download if available
  const checkForUpdate = useCallback(async () => {
    if (__DEV__) return false;
    try {
      setIsCheckingForUpdate(true);
      console.log(`Checking for updates (current version: ${appVersion})`);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // Download the update if available
        console.log('Update available, downloading...');
        await Updates.fetchUpdateAsync();
        console.log('Update downloaded successfully');
        setUpdateAvailable(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for or downloading update:", error);
      recordError(error, {
        function: "checkForUpdate",
        appVersion: appVersion || "unknown",
        context: "UpdatesContext",
      });
      return false;
    } finally {
      setIsCheckingForUpdate(false);
    }
  }, []);

  // Function to apply the update
  const applyUpdate = async () => {
    await Updates.reloadAsync();
  };

  const value = {
    checkForUpdate,
    isCheckingForUpdate,
    isUpdateAvailable,
    applyUpdate,
  };

  return (
    <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>
  );
};
