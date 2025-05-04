import Constants from "expo-constants";
import Device from "expo-device";
import Notifications from "expo-notifications";
import { callApi } from "./api";

export async function getAndSyncPushToken() {
  // Get the Expo push token
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!Device.isDevice) {
    console.warn("Using simulator - push notifications won't work");
    // Call API without push token on simulator
    await callApi("user/set-permissions-claim");
  } else {
    try {
      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log("Expo push token:", token.data);

      // Call our API endpoint with the push token
      await callApi("user/set-permissions-claim", {
        pushToken: token.data,
      });
    } catch (tokenError) {
      console.error("Error getting push token:", tokenError);
      // Call API without push token if we failed to get one
      await callApi("user/set-permissions-claim");
    }
  }
}
