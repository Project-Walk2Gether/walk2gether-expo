import { formatDistance, getDistanceMeters } from "./geo";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";

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
  return "Unknown distance";
};

/**
 * Function to reverse geocode a coordinate to get address information
 * 
 * @param latitude The latitude coordinate
 * @param longitude The longitude coordinate
 * @returns A formatted location object with name and coordinates
 */
export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const addressResult = data.results[0];
      const addressComponents = addressResult.address_components;

      // Extract locality (city) and route (street) if available
      let locality = "";
      let route = "";

      for (const component of addressComponents) {
        if (component.types.includes("locality")) {
          locality = component.long_name;
        }
        if (component.types.includes("route")) {
          route = component.long_name;
        }
      }

      // Create a name from the components or use a default
      const name = route || locality || "Selected Location";

      const newLocation = {
        name: name || addressResult.formatted_address || `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
      };

      return newLocation;
    } else {
      // Handle geocoding error
      const newLocation = {
        name: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
      };

      return newLocation;
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    // Fallback to coordinate-based location
    const newLocation = {
      name: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude,
    };

    return newLocation;
  }
};
