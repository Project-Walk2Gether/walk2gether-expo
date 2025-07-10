// Utility functions for geolocation

/**
 * Converts a radius in meters to appropriate map region values (latitudeDelta and longitudeDelta).
 * This is useful for setting the initial region of a MapView based on a desired radius.
 * 
 * @param lat Latitude of the center point (in degrees)
 * @param lon Longitude of the center point (in degrees)
 * @param radiusInMeters Radius in meters around the center point
 * @returns An object with latitude, longitude, latitudeDelta, and longitudeDelta for MapView
 */
export function getRegionForRadius(lat: number, lon: number, radiusInMeters: number) {
  // Calculate latitude delta - 1 degree of latitude is approximately 111,320 meters
  const latDelta = (radiusInMeters * 2.5) / 111320;
  
  // Calculate longitude delta - this varies based on latitude
  // The formula is: 1 degree of longitude = cos(latitude) * 111320 meters
  const longDelta = (radiusInMeters * 2.5) / (111320 * Math.cos(lat * (Math.PI / 180)));
  
  return {
    latitude: lat,
    longitude: lon,
    latitudeDelta: latDelta,
    longitudeDelta: longDelta,
  };
}

/**
 * Returns the distance between two lat/lng points in meters using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a distance in meters to a user-friendly string based on the preferred unit system
 * @param meters Distance in meters
 * @param unit Preferred unit system ('km' for metric or 'mi' for imperial)
 * @returns Formatted distance string
 */
export function formatDistance(meters: number, unit: "km" | "mi" = "km"): string {
  // For metric system (kilometers)
  if (unit === "km") {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }
  
  // For imperial system (miles)
  const feet = meters * 3.28084;
  if (feet < 1000) {
    return `${Math.round(feet)} ft`;
  }
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}
