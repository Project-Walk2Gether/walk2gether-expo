import { firestore_instance } from "@/config/firebase";
import { doc, setDoc } from "@react-native-firebase/firestore";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "../background/backgroundLocationTask";

type LocationTrackingResult = {
  userLocation: Location.LocationObject | null;
  locationPermission: boolean | null;
  backgroundLocationPermission: boolean | null;
  locationTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  updateLocation: (location: Location.LocationObject) => Promise<void>;
};

/**
 * Hook to manage location tracking functionality
 * @param walkId The ID of the walk to track location for
 * @param userId The ID of the user
 * @param updateExtraFields Optional callback to add extra fields to location updates
 */
export function useLocationTracking(
  walkId: string,
  userId: string | undefined,
  updateExtraFields?: () => Record<string, any>
): LocationTrackingResult {
  // Location state
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [backgroundLocationPermission, setBackgroundLocationPermission] =
    useState<boolean | null>(null);
  const [locationTracking, setLocationTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);

  // Request location permissions and initialize tracking
  useEffect(() => {
    if (walkId && userId) {
      (async () => {
        await requestPermissionsAndStartTracking();
      })();
    }

    return () => {
      // Clean up and stop tracking when component unmounts
      stopTracking();
    };
  }, [walkId, userId]);

  // Request permissions and start tracking
  const requestPermissionsAndStartTracking = async () => {
    // Request foreground permission first
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    setLocationPermission(foregroundStatus === "granted");

    if (foregroundStatus !== "granted") {
      Alert.alert(
        "Location Permission",
        "We need your location to show you on the map. Please enable location services for this app in your settings."
      );
      return;
    }

    // Request background permission
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    setBackgroundLocationPermission(backgroundStatus === "granted");

    if (backgroundStatus !== "granted") {
      Alert.alert(
        "Background Location Permission",
        "For best experience, please allow background location tracking. This lets us update your position even when the app is closed.",
        [
          { text: "Continue Anyway", style: "cancel" },
          {
            text: "Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                // On iOS we can open the app settings directly
                Linking.openURL("app-settings:");
              } else {
                // On Android we can't directly open location settings, so we open app settings
                Linking.openSettings();
              }
            },
          },
        ]
      );
      // Continue with foreground tracking only
    }

    // Get initial location
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setUserLocation(location);
      await updateLocation(location);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Could not get your current location. Please check your device settings."
      );
    }

    // Start location tracking based on permissions
    await startTracking();
  };

  // Start location tracking
  const startTracking = async () => {
    // Stop any existing tracking first
    await stopTracking();

    if (!userId || !walkId) return;

    if (backgroundLocationPermission) {
      // Start background location tracking using the imported function with walkId and userId
      await startBackgroundLocationTracking({
        walkId,
        userId,
        extraFields: updateExtraFields ? updateExtraFields() : {},
        foregroundService: {
          notificationTitle: "Walk2gether is tracking your location",
          notificationBody:
            "This allows others to see your location during the walk",
          notificationColor: "#FF5E0E", // Primary color
        },
      });
      setLocationTracking(true);
    } else if (locationPermission) {
      // Fallback to foreground tracking if background permissions not granted
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          setUserLocation(location);
          updateLocation(location);
        }
      );

      // Store the subscription for cleanup
      setLocationSubscription(subscription);
      setLocationTracking(true);
    }
  };

  // Stop location tracking
  const stopTracking = async () => {
    // Stop background tracking if it's running using the imported function
    await stopBackgroundLocationTracking();

    // Stop foreground tracking if it's running
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    setLocationTracking(false);
  };

  // Update user's location in Firestore
  const updateLocation = async (location: Location.LocationObject) => {
    if (!userId || !walkId) return;

    try {
      // Update the user's location in Firestore
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${userId}`
      );

      const extraFields = updateExtraFields ? updateExtraFields() : {};

      await setDoc(
        participantDocRef,
        {
          lastLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().getTime(),
          },
          ...extraFields,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  };

  return {
    userLocation,
    locationPermission,
    backgroundLocationPermission,
    locationTracking,
    startTracking,
    stopTracking,
    updateLocation,
  };
}
