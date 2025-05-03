import { formatDistance, getDistanceMeters } from "./geo";

// Generic location interface to handle different location formats in the app
export interface Location {
  latitude?: number;
  longitude?: number;
  name?: string;
}

export interface DistanceParams {
  // The target location (could be a walk location)
  targetLocation?:
    | Location
    | {
        latitude?: number;
        longitude?: number;
        name?: string;
      };
  // Current user coordinates
  userCoords?: {
    latitude?: number;
    longitude?: number;
  };
  loading?: boolean;
  error?: any;
}

/**
 * Calculate and format the distance between a user's current location and a target location
 *
 * @param params Parameters containing location details and user coordinates
 * @returns Formatted distance as a string, or status messages for loading/error states
 */
export const getDistanceToLocation = (params: DistanceParams): string => {
  const { targetLocation, userCoords, loading, error } = params;

  if (
    targetLocation?.latitude != null &&
    targetLocation?.longitude != null &&
    userCoords?.latitude != null &&
    userCoords?.longitude != null
  ) {
    const meters = getDistanceMeters(
      userCoords.latitude,
      userCoords.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );
    return formatDistance(meters);
  } else if (loading) {
    return "Locating...";
  } else if (error) {
    return "Location unavailable";
  }
};
