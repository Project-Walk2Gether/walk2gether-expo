import { useLocation } from "@/context/LocationContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { getDistanceMeters } from "@/utils/geo";
import { reverseGeocode } from "@/utils/locationUtils";
import { writeLogIfEnabled } from "@/utils/logging";
import functions from "@react-native-firebase/functions";
import { useCallback, useEffect, useRef, useState } from "react";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapView from "react-native-maps";
import { API } from "walk2gether-shared";

export const useLocationSelection = () => {
  const { updateFormData, setSystemErrors } = useWalkForm();
  const {
    refresh: getLocation,
    coords,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  // Refs
  const mapRef = useRef<MapView>(null);
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

  // State variables
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [pendingLocationRequest, setPendingLocationRequest] = useState(false);
  const [isTravelTimeLoading, setIsTravelTimeLoading] = useState(false);
  const [
    userMayNotMakeItToStartLocationInTime,
    setUserMayNotMakeItToStartLocationInTime,
  ] = useState(false);
  const [travelTimeInfo, setTravelTimeInfo] = useState<any>(null);

  // Use the imported reverseGeocode function with error handling
  const handleReverseGeocode = async (latitude: number, longitude: number) => {
    setIsReverseGeocoding(true);
    try {
      const newLocation = await reverseGeocode(latitude, longitude);
      updateFormData({ startLocation: newLocation });
      setSystemErrors([]); // Clear any previous system errors
      return newLocation;
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      setSystemErrors([
        "We couldn't determine the address for this location. Please try again or pick a different spot on the map.",
      ]);
      return null;
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  /**
   * Handle location selection from any source (map long press or current location)
   * This unified function handles:
   * 1. Reverse geocoding the coordinates
   * 2. Updating the form data
   * 3. Animating the map
   * 4. Setting the GooglePlaces text input
   */
  const handleLocationCoordinates = async (
    latitude: number,
    longitude: number,
    indicatorState?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (indicatorState) {
      indicatorState(true); // Set the appropriate loading indicator
    }

    try {
      // Reverse geocode and update form data
      const newLocation = await handleReverseGeocode(latitude, longitude);

      // Check if user's current location is near the selected location
      if (coords) {
        const distance = getDistanceMeters(
          coords.latitude,
          coords.longitude,
          latitude,
          longitude
        );

        // If user is within 50 meters of the start location, they are considered "at location"
        const isUserAtLocation = distance <= 200;
        console.log("SETTING ownerIsInitiallyAtLocation", { isUserAtLocation });
        updateFormData({ ownerIsInitiallyAtLocation: isUserAtLocation });
      }

      // Small delay before animating map to give time for state updates
      setTimeout(() => {
        // Animate map to selected location - this often forces marker re-renders
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }, 50);

      // Update the text in Google Places Autocomplete input
      if (googlePlacesRef.current && newLocation) {
        googlePlacesRef.current.setAddressText(newLocation.name);
      }

      return newLocation;
    } catch (error) {
      console.error("Error handling location coordinates:", error);
      return null;
    } finally {
      if (indicatorState) {
        indicatorState(false); // Reset the loading indicator
      }
    }
  };

  // Handle long press on map
  const handleMapLongPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    await handleLocationCoordinates(
      coordinate.latitude,
      coordinate.longitude,
      setLongPressActive
    );
  };

  const handleLocationSelect = (data: any, details: any) => {
    if (details && details.geometry) {
      const newLocation = {
        name:
          data.description ||
          data.structured_formatting?.main_text ||
          details.formatted_address ||
          "Selected Location",
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };

      updateFormData({ startLocation: newLocation });

      // Animate map to selected location
      mapRef.current?.animateToRegion({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleCurrentLocation = async () => {
    writeLogIfEnabled({
      message: "Location request started",
      metadata: { timestamp: new Date().toISOString() },
    });

    try {
      // Set the flag to indicate we're waiting for location coordinates
      setPendingLocationRequest(true);
      setIsReverseGeocoding(true);
      writeLogIfEnabled({
        message: "State flags set, about to call getLocation",
        metadata: {
          pendingLocationRequest: true,
          isReverseGeocoding: true,
        },
      });

      // Call getLocation to update the location context
      writeLogIfEnabled({ message: "Calling getLocation" });
      const location = await getLocation();
      writeLogIfEnabled({
        message: "getLocation completed successfully",
        metadata: { location },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      writeLogIfEnabled({
        message: "Error getting current location",
        metadata: { error: errorMessage, stack: errorStack },
      });
      console.error("Error getting current location:", error);
      setIsReverseGeocoding(false);
      setPendingLocationRequest(false);
    } finally {
      // Ensure flags are reset even if the code after getLocation() silently fails
      writeLogIfEnabled({
        message: "Location request completed (finally block)",
        metadata: { timestamp: new Date().toISOString() },
      });
    }
  };

  // Listen for coordinate changes when a location request is pending
  useEffect(() => {
    if (pendingLocationRequest && coords) {
      // We have new coordinates from a location request, process them
      handleLocationCoordinates(
        coords.latitude,
        coords.longitude,
        setIsReverseGeocoding
      );
      // Reset the pending flag
      setPendingLocationRequest(false);
    }
  }, [coords, pendingLocationRequest]);

  // Check if user is at the selected location when the component loads
  // or when user's coordinates or form location changes
  const { formData } = useWalkForm();
  const { startLocation } = formData;

  // Check travel time to determine if user can make it to the start location in time
  const checkTravelTime = useCallback(async () => {
    // Reset state
    setUserMayNotMakeItToStartLocationInTime(false);

    // Check if we have all required data
    if (!startLocation || !formData.date || !coords) {
      return;
    }

    // Only check for future walks
    const walkStartTime = formData.date.toMillis();
    const currentTime = Date.now();
    if (walkStartTime <= currentTime) {
      return;
    }

    setIsTravelTimeLoading(true);

    try {
      const checkTravelTimeFunction = functions().httpsCallable(
        "checkTravelTime",
        { timeout: 60000 }
      );

      const result = await checkTravelTimeFunction({
        origin: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        destination: {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
        },
        walkStartTime: walkStartTime,
        navigationMethod: "driving", // Default to driving for this check
      });

      const travelData = result.data as API.TravelTime.Check.ResponseBody;
      console.log({ travelData });
      setTravelTimeInfo(travelData);

      // Update state based on whether user can make it in time
      // We consider they may not make it if they'll arrive less than 10 minutes before start
      setUserMayNotMakeItToStartLocationInTime(!travelData.canMakeIt);
    } catch (err) {
      console.error("Error checking travel time:", err);
    } finally {
      setIsTravelTimeLoading(false);
    }
  }, [startLocation, formData.date, coords]);

  useEffect(() => {
    // Only run the check if we have both user coordinates and a start location
    if (coords && startLocation?.latitude && startLocation?.longitude) {
      const distance = getDistanceMeters(
        coords.latitude,
        coords.longitude,
        startLocation.latitude,
        startLocation.longitude
      );

      // If user is within 200 meters of the start location, they are considered "at location"
      const isUserAtLocation = distance <= 200;
      console.log("Initial location proximity check", {
        isUserAtLocation,
        distance,
      });
      updateFormData({ ownerIsInitiallyAtLocation: isUserAtLocation });

      // Check travel time when location changes
      checkTravelTime();
    }
  }, [
    coords,
    startLocation?.latitude,
    startLocation?.longitude,
    checkTravelTime,
  ]);

  // Also check travel time when the date changes
  useEffect(() => {
    if (startLocation?.latitude && startLocation?.longitude && formData.date) {
      checkTravelTime();
    }
  }, [formData.date, checkTravelTime]);

  return {
    mapRef,
    googlePlacesRef,
    locationLoading,
    locationError,
    isReverseGeocoding,
    longPressActive,
    pendingLocationRequest,
    handleLocationSelect,
    handleMapLongPress,
    handleCurrentLocation,
    handleLocationCoordinates,
    userMayNotMakeItToStartLocationInTime,
    isTravelTimeLoading,
    travelTimeInfo,
    checkTravelTime,
  };
};

export default useLocationSelection;
