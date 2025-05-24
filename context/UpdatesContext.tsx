import { recordError } from "@/utils/recordError";
import { appVersion } from "@/utils/version";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import React, {
  ComponentType,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { useFlashMessage } from "./FlashMessageContext";

interface UpdatesContextType {
  checkForUpdate: () => Promise<boolean>;
  isCheckingForUpdate: boolean;
  isUpdateAvailable: boolean;
  applyUpdate: () => Promise<void>;
  reloadApp: () => Promise<void>;
  setWelcomeMessage: (message: string) => Promise<void>;
  getWelcomeMessage: () => Promise<string | null>;
  clearWelcomeMessage: () => Promise<void>;
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

const UpdatesProviderComponent: React.FC<UpdatesProviderProps> = ({
  children,
}) => {
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false);
  const [isUpdateAvailable, setUpdateAvailable] = useState(false);
  const { showMessage } = useFlashMessage();

  // Check for updates when app comes to foreground
  // Storage keys
  const LAST_CHECK_TIME_KEY = "@walk2gether/lastUpdateCheckTime";
  const WELCOME_MESSAGE_KEY = "@walk2gether/welcomeMessage";
  
  // Check for stored welcome message on app load (after update)
  useEffect(() => {
    const checkForWelcomeMessage = async () => {
      try {
        const welcomeMessage = await AsyncStorage.getItem(WELCOME_MESSAGE_KEY);
        if (welcomeMessage) {
          // Display the welcome message
          showMessage(welcomeMessage, "success");
          // Clear the message so it doesn't show again
          await AsyncStorage.removeItem(WELCOME_MESSAGE_KEY);
        }
      } catch (error) {
        console.error("Error checking for welcome message:", error);
        recordError(error, {
          function: "checkForWelcomeMessage",
          appVersion: appVersion || "unknown",
          context: "UpdatesContext",
        });
      }
    };
    
    // Only run in production mode
    if (!__DEV__) {
      checkForWelcomeMessage();
    }
  }, [showMessage]);

  // Perform initial update check when app boots and track state changes
  useEffect(() => {
    if (__DEV__) return;

    const MIN_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

    const initialCheck = async () => {
      try {
        // Get the last check time from storage
        const storedLastCheckTime = await AsyncStorage.getItem(LAST_CHECK_TIME_KEY);
        let lastCheckTime = storedLastCheckTime ? parseInt(storedLastCheckTime, 10) : 0;
        
        // Check for update on boot if enough time has passed
        const now = Date.now();
        if (now - lastCheckTime > MIN_CHECK_INTERVAL) {
          console.log("App started - checking for updates");
          await checkForUpdate();
          // Update the last check time
          await AsyncStorage.setItem(LAST_CHECK_TIME_KEY, now.toString());
          lastCheckTime = now;
        }
      } catch (error) {
        console.error("Error during initial update check:", error);
        recordError(error, {
          function: "initialCheck",
          appVersion: appVersion || "unknown",
          context: "UpdatesContext",
        });
      }
    };

    // Run the initial check
    initialCheck();

    // Handle app state changes for subsequent update checks
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        try {
          // Get the last check time from storage
          const storedLastCheckTime = await AsyncStorage.getItem(LAST_CHECK_TIME_KEY);
          let lastCheckTime = storedLastCheckTime ? parseInt(storedLastCheckTime, 10) : 0;
          
          // Only check if enough time has passed since last check
          const now = Date.now();
          if (now - lastCheckTime > MIN_CHECK_INTERVAL) {
            console.log("App foregrounded - checking for updates");
            await checkForUpdate();
            // Update the last check time
            await AsyncStorage.setItem(LAST_CHECK_TIME_KEY, now.toString());
          }
        } catch (error) {
          console.error("Error during update check on app state change:", error);
          recordError(error, {
            function: "handleAppStateChange",
            appVersion: appVersion || "unknown",
            context: "UpdatesContext",
          });
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
        console.log("Update available, downloading...");
        await Updates.fetchUpdateAsync();
        console.log("Update downloaded successfully");
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
  const reloadApp = async () => {
    await Updates.reloadAsync();
  };

  // Welcome message functions for handling post-update messages
  const setWelcomeMessage = async (message: string) => {
    try {
      await AsyncStorage.setItem(WELCOME_MESSAGE_KEY, message);
    } catch (error) {
      console.error("Error saving welcome message:", error);
      recordError(error, {
        function: "setWelcomeMessage",
        appVersion: appVersion || "unknown",
        context: "UpdatesContext",
      });
    }
  };

  const getWelcomeMessage = async () => {
    try {
      return await AsyncStorage.getItem(WELCOME_MESSAGE_KEY);
    } catch (error) {
      console.error("Error getting welcome message:", error);
      recordError(error, {
        function: "getWelcomeMessage",
        appVersion: appVersion || "unknown",
        context: "UpdatesContext",
      });
      return null;
    }
  };

  const clearWelcomeMessage = async () => {
    try {
      await AsyncStorage.removeItem(WELCOME_MESSAGE_KEY);
    } catch (error) {
      console.error("Error clearing welcome message:", error);
      recordError(error, {
        function: "clearWelcomeMessage",
        appVersion: appVersion || "unknown",
        context: "UpdatesContext",
      });
    }
  };

  const value = {
    reloadApp,
    applyUpdate: reloadApp,
    checkForUpdate,
    isCheckingForUpdate,
    isUpdateAvailable,
    setWelcomeMessage,
    getWelcomeMessage,
    clearWelcomeMessage,
  };

  return (
    <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>
  );
};

// Export the UpdatesProvider as a standalone component
export const UpdatesProvider = UpdatesProviderComponent;

// Higher-Order Component to wrap components with UpdatesProvider
export const withUpdates = <P extends object>(Component: ComponentType<P>) => {
  const WithUpdatesWrapper = (props: P) => {
    return (
      <UpdatesProviderComponent>
        <Component {...props} />
      </UpdatesProviderComponent>
    );
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithUpdatesWrapper.displayName = `withUpdates(${displayName})`;

  return WithUpdatesWrapper;
};
