import { firestore_instance } from "@/config/firebase";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { isDevice } from "expo-device";
import Notifications from "expo-notifications";
import { writeLogIfEnabled } from "./logging";

export async function getAndSyncPushToken(user: FirebaseAuthTypes.User) {
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!isDevice) {
    console.warn("Using simulator - push notifications won't work");
  } else {
    try {
      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (token) {
        const userDoc = doc(firestore_instance, "users", user.uid);
        setDoc(
          userDoc,
          {
            expoPushToken: token,
            lastActiveAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
    } catch (tokenError) {
      writeLogIfEnabled({
        message: "Error getting push token",
        metadata: { error: tokenError },
      });
    }
  }
}
