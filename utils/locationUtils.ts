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
  targetLocation: {
    latitude: number;
    longitude: number;
  } | null;
  // Current user coordinates
  userCoords: {
    latitude: number;
    longitude: number;
  } | null;
  loading?: boolean;
  error?: string;
  distanceUnit?: "km" | "mi";
}

/**
 * Calculate and format the distance between a user's current location and a target location
 *
 * @param params Parameters containing location details, user coordinates, and preferred distance unit
 * @returns Formatted distance as a string, or status messages for loading/error states
 */
export const getDistanceToLocation = (params: DistanceParams): string => {
  const { targetLocation, userCoords, loading, error, distanceUnit = "km" } = params;

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
    return formatDistance(meters, distanceUnit);
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
/**
 * Extracts city, state, and country from Google Places address components
 * for a clean admin display format
 * 
 * @param addressComponents Array of address components from Google Places API
 * @returns Formatted string like "San Francisco, CA, USA" or fallback to formatted_address
 */
export const extractDisplayName = (addressComponents: any[], formattedAddress?: string): string => {
  if (!addressComponents || addressComponents.length === 0) {
    return formattedAddress || "Unknown Location";
  }

  let city = "";
  let state = "";
  let country = "";

  // Parse address components to extract city, state, and country
  for (const component of addressComponents) {
    const types = component.types;
    
    // City (locality or administrative_area_level_3 as fallback)
    if (types.includes("locality")) {
      city = component.long_name;
    } else if (!city && types.includes("administrative_area_level_3")) {
      city = component.long_name;
    }
    
    // State (administrative_area_level_1)
    if (types.includes("administrative_area_level_1")) {
      state = component.short_name; // Use short name for state abbreviation
    }
    
    // Country
    if (types.includes("country")) {
      country = component.short_name; // Use short name for country code
    }
  }

  // Build display name based on what we found
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (country) parts.push(country);

  // If we have at least city or state, use our formatted version
  if (parts.length > 0) {
    return parts.join(", ");
  }

  // Fallback to formatted address if we couldn't extract components
  return formattedAddress || "Unknown Location";
};

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
