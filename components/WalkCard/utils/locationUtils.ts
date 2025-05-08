import { formatDistance, getDistanceMeters } from "@/utils/geo";

// Helper function to calculate distance from user location to a walk location
export interface GetDistanceParams {
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
  coords?: {
    latitude?: number;
    longitude?: number;
  };
  loading?: boolean;
  error?: any;
}

/**
 * Calculate and format the distance between a user's current location and a walk location
 *
 * @param params Parameters containing location details and user coordinates
 * @returns Formatted distance as a string, or status messages for loading/error states
 */
export const getDistanceFromLocation = (params: GetDistanceParams): string => {
  const { location, coords, loading, error } = params;

  if (
    location?.latitude != null &&
    location?.longitude != null &&
    coords?.latitude != null &&
    coords?.longitude != null
  ) {
    const meters = getDistanceMeters(
      coords.latitude,
      coords.longitude,
      location.latitude,
      location.longitude
    );
    return formatDistance(meters);
  } else if (loading) {
    return "Locating...";
  } else if (error) {
    return "Location unavailable";
  } else {
    return "-";
  }
};
