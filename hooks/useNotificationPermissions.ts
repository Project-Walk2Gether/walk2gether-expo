import { doc, Timestamp, updateDoc } from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { isDevice } from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { firestore_instance } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

// Define a custom type that includes the properties we need
type NotificationPermissionStatus = {
  status: Notifications.PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
};

import { useRef } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export function useNotificationPermissions() {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (user) {
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
      const userRef = doc(firestore_instance, `users/${user.uid}`);
      await updateDoc(userRef, {
        expoPushToken: token,
        deviceInfo: {
          platform: Platform.OS,
          model: Device.modelName,
          osVersion: Platform.Version,
          lastUpdated: Timestamp.now(),
        },
      });
      console.log("Push token saved to Firebase");
    } catch (error) {
      console.error("Error saving push token to Firebase:", error);
    }
  };

  const checkPermissions = async () => {
    try {
      setLoading(true);

      // Get the current device permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus({
        status,
        granted: status === "granted",
        canAskAgain: true,
      });
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      // Update state with new status
      setPermissionStatus({
        status,
        granted: status === "granted",
        canAskAgain: true,
      });

      return status === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    permissionStatus,
    loading,
    expoPushToken,
    requestPermissions,
    checkPermissions,
  };
}
