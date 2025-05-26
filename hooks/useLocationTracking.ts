import { useLocation } from "@/context/LocationContext";
import { useDoc } from "@/utils/firestore";
import * as Location from "expo-location";
import { useEffect, useRef } from "react";
// Using FirebaseFirestoreTypes directly instead of a custom Walk type
import { writeLogIfEnabled } from "@/utils/logging";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { UserData } from "walk2gether-shared";

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
    updateLocation: updateLocationInContext,
  } = useLocation();

  // Fetch the walk data to get the estimatedEndTimeWithBuffer
  const { doc: walk } = useDoc<FirebaseFirestoreTypes.DocumentData>(
    `walks/${walkId}`
  );

  // Fetch user data to check background location tracking preference
  const { doc: userData } = useDoc<UserData>(userId ? `users/${userId}` : "");

  // Keep track of whether we've already stopped tracking due to endedAt
  const endedAtDetected = useRef(false);

  // Keep track of whether this component initiated the tracking
  const initiatedTracking = useRef(false);

  // Start tracking when walk and user IDs are available
  useEffect(() => {
    if (walkId && userId) {
      // If we're not tracking this specific walk already, start tracking
      if (activeWalkId !== walkId) {
        startTracking();
        initiatedTracking.current = true;
      }
    }

    return () => {
      // Only clean up tracking if one of these conditions is met:
      // 1. The walk has ended (checked via endedAtDetected.current)
      // 2. The user has explicitly opted out of background tracking
      // 3. This component initiated the tracking (to prevent breaking other components' tracking)
      const backgroundTrackingEnabled =
        userData?.backgroundLocationTrackingEnabled !== false;

      if (
        endedAtDetected.current ||
        !backgroundTrackingEnabled ||
        !initiatedTracking.current
      ) {
        console.log(
          "Stopping location tracking on component unmount, conditions:",
          {
            walkEnded: endedAtDetected.current,
            backgroundTrackingEnabled,
            initiatedTracking: initiatedTracking.current,
          }
        );
        stopTracking();
      } else {
        console.log(
          "Preserving background location tracking on component unmount"
        );
      }
    };
  }, [walkId, userId, userData?.backgroundLocationTrackingEnabled]);

  // Monitor the walk's endedAt property and stop tracking when it's set
  useEffect(() => {
    if (!walk || endedAtDetected.current) return;

    // Check if endedAt has been set on the walk
    if (walk.endedAt) {
      endedAtDetected.current = true;
      writeLogIfEnabled({
        message: `Stopping location tracking because walk ${walkId} has ended at ${walk.endedAt.toDate()}`,
      });

      console.log(`Walk ${walkId} has ended, stopping location tracking...`);
      stopTracking();
    }
  }, [walk]);

  // Start location tracking for this walk
  const startTracking = async () => {
    if (!walkId) return;

    // Get the estimatedEndTimeWithBuffer from the walk data
    // If it exists, it's a Firebase Timestamp that needs to be converted to a JS Date
    const endTimeWithBuffer = walk?.estimatedEndTimeWithBuffer;
    const endTime = endTimeWithBuffer ? endTimeWithBuffer.toDate() : undefined;

    await startWalkTracking(walkId, endTime);
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
