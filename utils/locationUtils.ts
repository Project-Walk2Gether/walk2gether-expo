import { formatDistance, getDistanceMeters } from "./geo";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { Linking, Platform } from "react-native";

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

      // Extract street number, route, and locality for a concise address
      let streetNumber = "";
      let route = "";
      let locality = "";
      for (const component of addressComponents) {
        if (component.types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (component.types.includes("route")) {
          route = component.long_name;
        }
        if (component.types.includes("locality")) {
          locality = component.long_name;
        }
      }
      let conciseAddress = "";
      if (streetNumber && route && locality) {
        conciseAddress = `${streetNumber} ${route}, ${locality}`;
      } else if (route && locality) {
        conciseAddress = `${route}, ${locality}`;
      } else if (addressResult.formatted_address) {
        conciseAddress = addressResult.formatted_address;
      } else {
        conciseAddress = `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      const newLocation = {
        name: conciseAddress,
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

/**
 * Opens the location in the device's default maps app
 * 
 * @param latitude The latitude coordinate
 * @param longitude The longitude coordinate
 * @param label Optional label for the location
 */
export const openLocationInMaps = (
  latitude: number,
  longitude: number,
  label?: string
) => {
  const location = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : 'Location';

  let url: string;
  
  if (Platform.OS === 'ios') {
    // Apple Maps format
    url = `maps:?q=${encodedLabel}&ll=${location}`;
  } else {
    // Google Maps format for Android and fallback
    url = `https://www.google.com/maps/search/?api=1&query=${location}`;
  }

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        // Fallback to Google Maps web URL if the maps app can't be opened
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${location}`;
        return Linking.openURL(fallbackUrl);
      }
    })
    .catch((error) => {
      console.error('Error opening map link:', error);
    });
};
