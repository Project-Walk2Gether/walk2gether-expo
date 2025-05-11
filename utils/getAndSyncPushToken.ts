import { firestore_instance } from "@/config/firebase";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { doc, setDoc } from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { isDevice } from "expo-device";
import Notifications from "expo-notifications";
import { callApi } from "./api";

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
            pushToken: token,
          },
          { merge: true }
        );
      }
    } catch (tokenError) {
      console.error("Error getting push token:", tokenError);
      // Call API without push token if we failed to get one
      await callApi("user/set-permissions-claim");
    }
  }
}
