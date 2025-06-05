import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { notificationErrorHandler } from "@/utils/errorReporting";
import { writeLogIfEnabled } from "@/utils/logging";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { isDevice, modelName } from "expo-device";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

// Define a custom type that includes the properties we need
type NotificationPermissionStatus = {
  status: Notifications.PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
};

// Configure the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

interface NotificationsContextType {
  permissionStatus: NotificationPermissionStatus | null;
  expoPushToken: string | null;
  loading: boolean;
  error: any;
  requestPermissions: () => Promise<boolean>;
  checkPermissions: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Register notification listeners
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);

        // Handle navigation if URL is provided in the notification data
        const url = response.notification.request.content.data?.url;
        if (url && typeof url === "string") {
          // Use router to navigate to the specified URL
          try {
            const router = require("expo-router");
            router.router.push(url);
            console.log(`Navigated to ${url} from notification`);
          } catch (error) {
            // Use our domain-specific error handler
            notificationErrorHandler.reportNonFatalError(
              error,
              { notificationUrl: url, response: response }, 
              "Failed to navigate from notification"
            );
          }
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Get push token when permissions are granted
  useEffect(() => {
    if (permissionStatus?.granted) {
      console.log("Permissions granted, registering for push notifications");
      registerForPushNotificationsAsync()
        .then((token) => {
          console.log("Push token received:", token);
          setExpoPushToken(token);
        })
        .catch((error) => {
          console.error("Error registering for push notifications:", error);
          writeLogIfEnabled({
            message: "Error registering for push notifications",
            metadata: { error },
          });
        });
    }
  }, [permissionStatus?.granted]);

  // Save token to Firebase when available and user is authenticated
  useEffect(() => {
    if (user && expoPushToken) {
      writeLogIfEnabled({
        message: "User and expoPushToken available, saving to Firebase",
        metadata: {
          uid: user.uid,
          tokenLength: expoPushToken.length,
        },
      });
      saveTokenToFirebase(expoPushToken);
    }
  }, [user, expoPushToken]);

  // Check for permissions on load
  useEffect(() => {
    checkPermissions();
  }, []);

  // Save token to Firebase
  const saveTokenToFirebase = async (token: string | null) => {
    if (!user) return;
    try {
      console.log(`Saving push token for user ${user.uid}`);
      const userRef = doc(firestore_instance, `users/${user.uid}`);
      await setDoc(
        userRef,
        {
          expoPushToken: token,
          deviceInfo: {
            platform: Platform.OS,
            model: modelName,
            osVersion: Platform.Version,
            lastUpdated: Timestamp.now(),
          },
        },
        { merge: true }
      );
      console.log("✅ Push token successfully saved to Firebase");
    } catch (error) {
      console.error("❌ Error saving push token to Firebase:", error);
      writeLogIfEnabled({
        message: "Failed to save push token to Firebase",
        metadata: { error, uid: user.uid },
      });
    }
  };

  const checkPermissions = async () => {
    try {
      setLoading(true);

      // Get the current device permission status
      const result = await Notifications.getPermissionsAsync();
      setPermissionStatus(result);
    } catch (error: any) {
      console.error("Error checking notification permissions:", error);
      setError(error);
      writeLogIfEnabled({
        message: "Error checking notification permissions",
        metadata: { error },
      });
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);

      // Request permissions
      const result = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      // Update state with new status
      setPermissionStatus(result);

      return result.granted;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      writeLogIfEnabled({
        message: "Error requesting notification permissions",
        metadata: { error },
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    // Check all possible paths for project ID
    const projectId = Constants.expoConfig!.extra!.eas!.projectId;

    if (!isDevice) {
      console.warn("Using simulator - push notifications won't work");
      return null;
    }

    try {
      if (!projectId) {
        console.warn("No project ID found for push notifications");
        return null;
      }

      // Get the Expo push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log("Successfully got Expo push token");
      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);

      // Prepare enhanced error details for better debugging
      const errorObj = error as Error;
      const errorDetails = {
        error,
        message: errorObj.message || "Unknown error message",
        name: errorObj.name || "Unknown error type",
        stack: errorObj.stack || "No stack trace available",
        projectId: projectId || "Not provided",
        isDevice,
        timestamp: new Date().toISOString(),
      };

      console.log(
        "Detailed error information:",
        JSON.stringify(errorDetails, null, 2)
      );

      writeLogIfEnabled({
        message: "Error getting push token",
        metadata: errorDetails,
      });
      return null;
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        permissionStatus,
        expoPushToken,
        loading,
        error,
        requestPermissions,
        checkPermissions,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
