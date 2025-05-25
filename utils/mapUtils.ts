import { Region } from "react-native-maps";

/**
 * A geographical coordinate with latitude and longitude
 */
interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculate a map region that includes both user location and destination with padding
 * @param userLocation User's current location coordinates
 * @param destinationLocation Destination coordinates (e.g., walk start location)
 * @param padding Padding percentage to add around the bounds (default: 1.3 = 30% padding)
 * @returns A Region object compatible with react-native-maps
 */
export function calculateOptimalRegion(
  userLocation: Coordinate | null | undefined,
  destinationLocation: Coordinate | null | undefined,
  padding: number = 1.3
): Region {
  // Default region (fallback)
  const defaultRegion: Region = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // If either location is missing, return a region centered on the available one
  if (!userLocation && !destinationLocation) {
    return defaultRegion;
  }

  if (userLocation && !destinationLocation) {
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  if (!userLocation && destinationLocation) {
    return {
      latitude: destinationLocation.latitude,
      longitude: destinationLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  // At this point, both locations are available
  const userLat = userLocation!.latitude;
  const userLng = userLocation!.longitude;
  const destLat = destinationLocation!.latitude;
  const destLng = destinationLocation!.longitude;

  // Calculate the center point between the two locations
  const centerLat = (userLat + destLat) / 2;
  const centerLng = (userLng + destLng) / 2;

  // Calculate the distance between points to determine zoom level
  const latDelta = Math.abs(userLat - destLat) * padding;
  const lngDelta = Math.abs(userLng - destLng) * padding;

  // Ensure minimum zoom level for better visibility
  const minDelta = 0.02;
  const finalLatDelta = Math.max(latDelta, minDelta);
  const finalLngDelta = Math.max(lngDelta, minDelta);

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: finalLatDelta,
    longitudeDelta: finalLngDelta,
  };
}
