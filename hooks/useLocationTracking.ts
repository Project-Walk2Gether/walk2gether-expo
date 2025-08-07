import { useLocation } from "@/context/LocationContext";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { writeLogIfEnabled } from "@/utils/logging";
import { WalkBase, Participant, WithId } from "walk2gether-shared";

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
 * Tracks location when:
 * - walk.startedAt is present
 * - currentTime < walk.endTimeWithBuffer
 * - currentUserParticipant.status !== "pending"
 *
 * @param walk The walk object
 * @param currentUserParticipant The current user's participant object
 */
export function useLocationTracking(
  walk: WalkBase | null,
  currentUserParticipant: WithId<Participant> | null | undefined
): LocationTrackingResult {
  // Access the global location context
  const {
    userLocation,
    locationPermission,
    backgroundLocationPermission,
    locationTracking,
    startWalkTracking,
    stopWalkTracking,
    updateLocation: updateLocationInContext,
  } = useLocation();

  // Keep track of whether this component initiated the tracking
  const initiatedTracking = useRef(false);
  
  // Manage our own active walk state
  const [activeWalkId, setActiveWalkId] = useState<string | null>(null);

  // Determine if we should be tracking based on the simplified conditions
  const shouldTrack = useMemo(() => {
    if (!walk || !currentUserParticipant) return false;

    // Must have started
    if (!walk.startedAt) return false;

    // Must not be pending
    if (currentUserParticipant.status === "pending") return false;

    // Must be before end time with buffer
    if (walk.endTimeWithBuffer) {
      const currentTime = new Date();
      const endTime = walk.endTimeWithBuffer.toDate();
      if (currentTime >= endTime) return false;
    }

    return true;
  }, [walk, currentUserParticipant]);

  // Start or stop tracking based on conditions
  useEffect(() => {
    if (!walk?.id) return;

    if (shouldTrack) {
      // Start tracking if we should be tracking and we're not already tracking this walk
      if (activeWalkId !== walk.id) {
        console.log(`Starting location tracking for walk ${walk.id}`);
        startTracking();
        initiatedTracking.current = true;
        setActiveWalkId(walk.id);
      }
    } else {
      // Stop tracking if we shouldn't be tracking and we initiated tracking
      if (initiatedTracking.current && activeWalkId === walk.id) {
        console.log(`Stopping location tracking for walk ${walk.id}`);
        stopTracking();
        initiatedTracking.current = false;
        setActiveWalkId(null);
      }
    }
  }, [shouldTrack, walk?.id, activeWalkId]);

  // Subscribe to location updates and update Firebase when we have an active walk
  useEffect(() => {
    if (activeWalkId && userLocation) {
      updateLocationInContext(activeWalkId, userLocation);
    }
  }, [activeWalkId, userLocation, updateLocationInContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (initiatedTracking.current) {
        console.log("Stopping location tracking on component unmount");
        stopTracking();
        setActiveWalkId(null);
      }
    };
  }, []);

  // Start location tracking for this walk
  const startTracking = async () => {
    if (!walk) return;

    // Get the endTimeWithBuffer from the walk data
    const endTime = walk.endTimeWithBuffer
      ? walk.endTimeWithBuffer.toDate()
      : undefined;

    await startWalkTracking(walk.id!, endTime);
  };

  // Stop location tracking
  const stopTracking = async () => {
    await stopWalkTracking();
  };

  // Update location for this walk
  const updateLocation = async (location: Location.LocationObject) => {
    if (activeWalkId) {
      await updateLocationInContext(activeWalkId, location);
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
