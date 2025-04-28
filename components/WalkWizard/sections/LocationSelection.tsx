import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { Text, View, YStack } from "tamagui";
import { useWalkForm } from "../../../context/WalkFormContext";
import { COLORS } from "../../../styles/colors";
import WizardWrapper from "./WizardWrapper";

interface LocationSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || "";

// Check if API key is available to provide user feedback
const isApiKeyMissing = !GOOGLE_MAPS_API_KEY;

export const LocationSelection: React.FC<LocationSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData, userLocation, isLocationLoading, locationError } = useWalkForm();
  const [location, setLocation] = useState(formData.location || null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const mapRef = useRef<MapView>(null);
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

  // Set initial region based on saved location, user location, or default
  const [region, setRegion] = useState({
    latitude: formData.location?.latitude || userLocation?.latitude || 37.78825,
    longitude: formData.location?.longitude || userLocation?.longitude || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Update region when user location changes
  useEffect(() => {
    if (userLocation && !formData.location) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation, formData.location]);

  const handleLocationSelect = (data: any, details: any) => {
    if (details && details.geometry) {
      const newLocation = {
        name: data.structured_formatting?.main_text || "Selected Location",
        description: data.description || details.formatted_address || "",
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };

      setLocation(newLocation);
      updateFormData({ location: newLocation });

      // Animate map to selected location
      mapRef.current?.animateToRegion({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Function to reverse geocode a coordinate to get address information
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setIsReverseGeocoding(true);
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
          name,
          description:
            addressResult.formatted_address ||
            `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude,
        };

        setLocation(newLocation);
        updateFormData({ location: newLocation });
        return newLocation;
      } else {
        // Handle geocoding error
        const newLocation = {
          name: "Selected Location",
          description: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(
            6
          )}`,
          latitude,
          longitude,
        };

        setLocation(newLocation);
        updateFormData({ location: newLocation });
        return newLocation;
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      // Fallback to coordinate-based location
      const newLocation = {
        name: "Selected Location",
        description: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(
          6
        )}`,
        latitude,
        longitude,
      };

      setLocation(newLocation);
      updateFormData({ location: newLocation });
      return newLocation;
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Handle long press on map
  const handleMapLongPress = async (event: any) => {
    // Provide visual feedback that long press is detected
    setLongPressActive(true);

    const { coordinate } = event.nativeEvent;
    const newLocation = await reverseGeocode(
      coordinate.latitude,
      coordinate.longitude
    );

    console.log({ newLocation });

    // Update the text in Google Places Autocomplete input
    if (googlePlacesRef.current && newLocation) {
      // Clear the input first to ensure proper update

      console.log("Setting", { ref: googlePlacesRef.current });
      // googlePlacesRef.current.clear();
      // Then set the text input value with the resolved address
      googlePlacesRef.current.setAddressText(
        newLocation.description || newLocation.name
      );
    }

    // Reset the long press indicator
    setLongPressActive(false);
  };

  const handleContinue = () => {
    if (location) {
      onContinue();
    }
  };

  return (
    <WizardWrapper
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!location}
    >
      <YStack gap="$4">
        <View zIndex={1}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search for a location or long-press on map"
            onPress={handleLocationSelect}
            fetchDetails={true}
            keyboardShouldPersistTaps="handled"
            styles={{
              container: {
                flex: 0,
              },
              textInput: {
                height: 50,
                borderRadius: 10,
                paddingHorizontal: 15,
                fontSize: 16,
              },
              listView: {
                backgroundColor: "white",
                borderRadius: 10,
                marginTop: 5,
              },
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: "en",
            }}
          />
        </View>

        <View
          flex={1}
          height={300}
          borderRadius={15}
          overflow="hidden"
          position="relative"
        >
          {!isApiKeyMissing && (
            <MapView
              ref={mapRef}
              style={{ width: "100%", height: "100%" }}
              initialRegion={region}
              onLongPress={handleMapLongPress}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={location.name}
                  description={location.description}
                />
              )}
            </MapView>
          )}

          <Text color="white" fontSize={14} fontWeight="500" textAlign="center">
            Tap and hold on the map to choose a location
          </Text>

          {(isReverseGeocoding || longPressActive || isLocationLoading) && (
            <View
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(255, 255, 255, 0.7)"
              justifyContent="center"
              alignItems="center"
              zIndex={2}
            >
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text marginTop={10} color={COLORS.text} fontSize={14}>
                {longPressActive
                  ? "Location selected! Getting details..."
                  : isLocationLoading
                  ? "Getting your location..."
                  : "Getting location details..."}
              </Text>
            </View>
          )}
          {isApiKeyMissing && (
            <View
              style={{ width: "100%", height: "100%" }}
              backgroundColor="rgba(0, 0, 0, 0.2)"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                color={COLORS.textOnDark}
                textAlign="center"
                fontWeight="600"
              >
                Map preview unavailable without API key
              </Text>
            </View>
          )}
          {locationError && !isApiKeyMissing && (
            <View
              style={{ width: "100%", height: "100%" }}
              backgroundColor="rgba(0, 0, 0, 0.2)"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                color={COLORS.textOnDark}
                textAlign="center"
                fontWeight="600"
              >
                {locationError}
              </Text>
            </View>
          )}
        </View>
      </YStack>
    </WizardWrapper>
  );
};

export default LocationSelection;
