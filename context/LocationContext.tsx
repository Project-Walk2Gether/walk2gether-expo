import * as Location from "expo-location";
import * as Linking from "expo-linking";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import { locationService } from "@/utils/locationService";
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/background/backgroundLocationTask";
import { writeLogIfEnabled } from "@/utils/logging";

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
  refresh: () => Promise<void>;
  requestPermissions: () => Promise<{foreground: boolean; background: boolean}>;
  
  // Walk tracking
  activeWalkId?: string;
  activeUserId?: string;
  locationTracking: boolean;
  startWalkTracking: (walkId: string, userId: string, estimatedEndTimeWithBuffer?: Date) => Promise<boolean>;
  stopWalkTracking: () => Promise<void>;
  updateLocation: (location: Location.LocationObject) => Promise<void>;
}

const LocationContext = createContext<LocationContextValue>({
  loading: false,
  userLocation: null,
  locationPermission: null,
  backgroundLocationPermission: null,
  locationTracking: false,
  refresh: async () => {},
  requestPermissions: async () => ({ foreground: false, background: false }),
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
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Permissions
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [backgroundLocationPermission, setBackgroundLocationPermission] = 
    useState<boolean | null>(null);

  // Walk tracking state
  const [activeWalkId, setActiveWalkId] = useState<string>();
  const [activeUserId, setActiveUserId] = useState<string>();
  const [locationTracking, setLocationTracking] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Fetch location on initial mount
  useEffect(() => {
    getLocation();
    checkPermissions();
  }, []);

  // Check existing permissions without requesting them
  const checkPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus === "granted");

      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      setBackgroundLocationPermission(backgroundStatus === "granted");
    } catch (e) {
      console.error("Error checking permissions:", e);
    }
  };

  // Request permissions with UI flow
  const requestPermissions = async () => {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus === "granted");

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need your location to show you on the map. Please enable location services for this app in your settings."
        );
        return { foreground: false, background: false };
      }

      // Request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
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
        // Continue with foreground only
      }

      return { 
        foreground: foregroundStatus === "granted", 
        background: backgroundStatus === "granted" 
      };
    } catch (e) {
      console.error("Error requesting permissions:", e);
      return { foreground: false, background: false };
    }
  };

  // Get current location (used for initial location and refresh)
  const getLocation = async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Check if we have permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        // Only request if we don't already have permission
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          setError("Location permission not granted");
          setLoading(false);
          return;
        }
      }

      // Get the location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation(loc);
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // If we're actively tracking a walk, update the location there too
      if (activeWalkId && activeUserId && locationTracking) {
        await updateLocation(loc);
      }
    } catch (e: any) {
      setError(e.message || "Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  // Start tracking location for a specific walk
  const startWalkTracking = async (walkId: string, userId: string, estimatedEndTimeWithBuffer?: Date) => {
    if (!walkId || !userId) {
      console.error("Cannot start tracking without walkId and userId");
      return false;
    }

    try {
      // Store the active walk and user
      setActiveWalkId(walkId);
      setActiveUserId(userId);

      // Make sure we have permissions
      const { foreground, background } = await requestPermissions();
      if (!foreground) {
        return false;
      }

      // Stop any existing tracking
      await stopWalkTracking();

      // Get initial location and store it
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setUserLocation(initialLocation);
      await updateLocation(initialLocation);

      // Start background tracking if we have permission
      if (background) {
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
          endTime: estimatedEndTimeWithBuffer
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
            updateLocation(location);
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
      setActiveWalkId(undefined);
      setActiveUserId(undefined);
    } catch (e) {
      console.error("Error stopping walk tracking:", e);
    }
  };

  // Update location in Firebase
  const updateLocation = async (location: Location.LocationObject) => {
    if (!activeWalkId || !activeUserId) return;

    try {
      await locationService.updateLocation(activeWalkId, activeUserId, location);
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
        activeWalkId,
        activeUserId,
        locationTracking,
        refresh: getLocation,
        requestPermissions,
        startWalkTracking,
        stopWalkTracking,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
