import { useLocation } from "@/context/LocationContext";
import * as Location from "expo-location";
import { useEffect } from "react";

/**
 * Result type for the useLocationTracking hook
 * Provides access to location data and tracking controls
 */
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
 * Hook to manage location tracking functionality for walks
 * This is a thin wrapper around LocationContext that provides walk-specific tracking
 * 
 * @param walkId The ID of the walk to track location for
 * @param userId The ID of the user
 */
export function useLocationTracking(
  walkId: string,
  userId: string
): LocationTrackingResult {
  // Access the global location context
  const { 
    userLocation,
    locationPermission,
    backgroundLocationPermission,
    locationTracking,
    activeWalkId,
    startWalkTracking, 
    stopWalkTracking,
    updateLocation: updateLocationInContext
  } = useLocation();

  // Start tracking when walk and user IDs are available
  useEffect(() => {
    if (walkId && userId) {
      // If we're not tracking this specific walk already, start tracking
      if (activeWalkId !== walkId) {
        startTracking();
      }
    }

    return () => {
      // Clean up and stop tracking when component unmounts
      stopTracking();
    };
  }, [walkId, userId]);

  // Start location tracking for this walk
  const startTracking = async () => {
    if (!walkId || !userId) return;
    await startWalkTracking(walkId, userId);
  };

  // Stop location tracking
  const stopTracking = async () => {
    await stopWalkTracking();
  };

  // Update location for this walk
  const updateLocation = async (location: Location.LocationObject) => {
    await updateLocationInContext(location);
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
