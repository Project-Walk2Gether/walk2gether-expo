import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/background/backgroundLocationTask";
import { auth_instance } from "@/config/firebase";
import { locationService } from "@/utils/locationService";
import { writeLogIfEnabled } from "@/utils/logging";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Platform } from "react-native";

interface LocationContextValue {
  // Basic location data
  coords?: { latitude: number; longitude: number };
  userLocation: Location.LocationObject | null;
  error?: string;
  loading: boolean;

  // Permissions
  locationPermission: boolean | null;
  backgroundLocationPermission: boolean | null;

  // General location methods
  refresh: () => Promise<Location.LocationObject | null | undefined>;
  // Separated permission methods
  requestForegroundPermissions: () => Promise<boolean>;
  requestBackgroundPermissions: () => Promise<boolean>;

  // Walk tracking
  locationTracking: boolean;
  startWalkTracking: (
    walkId: string,
    endTimeWithBuffer?: Date
  ) => Promise<boolean>;
  stopWalkTracking: () => Promise<void>;
  updateLocation: (walkId: string, location: Location.LocationObject) => Promise<void>;
}

const LocationContext = createContext<LocationContextValue>({
  loading: false,
  userLocation: null,
  locationPermission: null,
  backgroundLocationPermission: null,
  locationTracking: false,
  refresh: async () => null,
  requestForegroundPermissions: async () => false,
  requestBackgroundPermissions: async () => false,
  startWalkTracking: async () => false,
  stopWalkTracking: async () => {},
  updateLocation: async () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Basic location state
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Permissions
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [backgroundLocationPermission, setBackgroundLocationPermission] =
    useState<boolean | null>(null);

  // Walk tracking state
  const [locationTracking, setLocationTracking] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  // Fetch location on initial mount
  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      getLocation();
    }
  }, [locationPermission]);

  // Check existing permissions without requesting them
  const checkPermissions = async () => {
    try {
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus === "granted");

      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();
      setBackgroundLocationPermission(backgroundStatus === "granted");
    } catch (e) {
      console.error("Error checking permissions:", e);
    }
  };

  // Request foreground permissions only
  const requestForegroundPermissions = async () => {
    try {
      // Request foreground permission
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus === "granted");

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need your location to show you on the map. Please enable location services for this app in your settings."
        );
        return false;
      }

      return foregroundStatus === "granted";
    } catch (e) {
      console.error("Error requesting foreground permissions:", e);
      return false;
    }
  };

  // Request background permissions only
  const requestBackgroundPermissions = async () => {
    try {
      // Check if foreground permission is granted first (required for background)
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();

      console.log("Requesting background permissions");

      if (foregroundStatus !== "granted") {
        // Need foreground permission first
        const foregroundGranted = await requestForegroundPermissions();
        if (!foregroundGranted) return false;
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
        return false;
      }

      return backgroundStatus === "granted";
    } catch (e) {
      console.error("Error requesting background permissions:", e);
      return false;
    }
  };

  // Mock location data for simulator
  const getMockLocation = (): Location.LocationObject => {
    // Return mock location data for San Francisco
    return {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        accuracy: 5,
        altitudeAccuracy: 5,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    };
  };

  // Get current location (used for initial location and refresh)
  const getLocation = async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Check if running on a simulator
      const isSimulator = (await Device.isDevice) === false;

      if (isSimulator) {
        // Use mock location data for simulator
        console.log("Using mock location for simulator");
        const mockLoc = getMockLocation();

        setUserLocation(mockLoc);
        setCoords({
          latitude: mockLoc.coords.latitude,
          longitude: mockLoc.coords.longitude,
        });

        return mockLoc;
      }

      // For real devices, continue with normal flow
      // Check if we have permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        // Only request if we don't already have permission
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          setError("Location permission not granted");
          setLoading(false);
          return;
        }
      }

      // Create a promise that will resolve with the location
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Create a timeout promise that will reject after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Location request timed out after 10 seconds"));
        }, 10000); // 10 second timeout
      });

      // Race the location promise against the timeout
      const loc = (await Promise.race([
        locationPromise,
        timeoutPromise,
      ])) as Location.LocationObject;

      setUserLocation(loc);
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      return loc;
    } catch (e: any) {
      console.warn("Location error:", e);
      setError(e.message || "Failed to get location");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Start tracking location for a specific walk
  const startWalkTracking = async (
    walkId: string,
    endTimeWithBuffer?: Date
  ) => {
    if (!walkId) {
      console.error("Cannot start tracking without walkId");
      return false;
    }

    console.log("Starting walk tracking for walkId: " + walkId);

    const userId = auth_instance.currentUser?.uid;
    if (!userId) {
      console.error("Cannot start tracking without authenticated user");
      return false;
    }

    try {
      // Stop any existing tracking
      await stopWalkTracking();

      // Get initial location and store it
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setUserLocation(initialLocation);
      await updateLocation(walkId, initialLocation);

      // Start background tracking if we have permission and it's enabled by user preference
      if (backgroundLocationPermission) {
        await writeLogIfEnabled({
          message: `Starting background tracking for walkId: ${walkId}, userId: ${userId}`,
        });

        await startBackgroundLocationTracking({
          walkId,
          userId,
          // Don't be too aggressive with updates to save battery
          timeInterval: 15000, // 15 seconds
          distanceInterval: 10, // 10 meters,
          // Pass the estimated end time if available
          endTime: endTimeWithBuffer,
        });
        setLocationTracking(true);
        return true;
      } else {
        // Fallback to foreground tracking
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (location) => {
            setUserLocation(location);
          }
        );

        locationSubscription.current = subscription;
        setLocationTracking(true);
        return true;
      }
    } catch (e) {
      console.error("Error starting walk tracking:", e);
      return false;
    }
  };

  // Stop tracking location for the active walk
  const stopWalkTracking = async () => {
    try {
      // Stop background tracking
      await stopBackgroundLocationTracking();

      // Stop foreground tracking
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      // Reset state
      setLocationTracking(false);
    } catch (e) {
      console.error("Error stopping walk tracking:", e);
    }
  };

  // Update location in Firebase
  const updateLocation = async (walkId: string, location: Location.LocationObject) => {
    if (!walkId) return;

    const userId = auth_instance.currentUser?.uid;
    if (!userId) return;

    try {
      await locationService.updateLocation(walkId, userId, location);
    } catch (e) {
      console.error("Error updating location in Firebase:", e);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        coords,
        userLocation,
        error,
        loading,
        locationPermission,
        backgroundLocationPermission,
        locationTracking,
        refresh: getLocation,
        requestForegroundPermissions,
        requestBackgroundPermissions,
        startWalkTracking,
        stopWalkTracking,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
