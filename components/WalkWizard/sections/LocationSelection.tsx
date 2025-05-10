import { PlacesAutocomplete } from "@/components/UI/PlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { useLocation } from "@/context/LocationContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { Button, Text, View, XStack, YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";

interface LocationSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

export const LocationSelection: React.FC<LocationSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const {
    refresh: getLocation,
    coords,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  console.log({ locationLoading });
  const [location, setLocation] = useState(formData.location || null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const mapRef = useRef<MapView>(null);
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

  // Set initial region based on saved location, context coords, or default
  const [region, setRegion] = useState({
    latitude: formData.location?.latitude || coords?.latitude || 37.78825,
    longitude: formData.location?.longitude || coords?.longitude || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Update region when coords change
  useEffect(() => {
    console.log("Running", { coords, location: formData.location });
    if (coords && !formData.location) {
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [!!coords, !!formData.location]);

  // Update when coords from LocationContext changes
  useEffect(() => {
    console.log("Coords", { coords });
    if (coords && !isReverseGeocoding) {
      reverseGeocode(coords.latitude, coords.longitude);

      // Animate map to selected location
      mapRef.current?.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [!!coords]);

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
          <PlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search for a location or long-press on map"
            onSelect={(data) =>
              handleLocationSelect(
                {
                  description: data.name,
                  structured_formatting: { main_text: data.name },
                  place_id: data.placeId,
                },
                {
                  geometry: {
                    location: {
                      lat: data.latitude,
                      lng: data.longitude,
                    },
                  },
                  formatted_address: data.description,
                }
              )
            }
            googleApiKey={GOOGLE_MAPS_API_KEY}
            textInputStyles={{
              height: 50,
              borderRadius: 10,
              paddingHorizontal: 15,
              fontSize: 16,
            }}
          />
        </View>

        <XStack
          marginTop={10}
          marginBottom={12}
          space="$2"
          justifyContent="center"
        >
          <Button
            backgroundColor={COLORS.primary}
            color="white"
            onPress={async () => {
              setIsReverseGeocoding(true);
              try {
                await getLocation();
                // After getting the location, we need to call reverse geocode
                if (coords) {
                  const newLocation = await reverseGeocode(
                    coords.latitude,
                    coords.longitude
                  );

                  // Update the text input field with the resolved address
                  if (googlePlacesRef.current && newLocation) {
                    googlePlacesRef.current.setAddressText(
                      newLocation.description || newLocation.name
                    );
                  }
                }
              } finally {
                setIsReverseGeocoding(false);
              }
            }}
            pressStyle={{ opacity: 0.8 }}
            disabled={locationLoading || isReverseGeocoding}
          >
            {locationLoading
              ? "Getting location..."
              : "Use my current location"}
          </Button>
        </XStack>

        <View
          flex={1}
          height={300}
          borderRadius={15}
          overflow="hidden"
          position="relative"
        >
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

          <Text color="white" fontSize={14} fontWeight="500" textAlign="center">
            Tap and hold on the map to choose a location
          </Text>

          {(isReverseGeocoding || longPressActive || locationLoading) && (
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
                  : locationLoading
                  ? "Getting your location..."
                  : "Getting location details..."}
              </Text>
            </View>
          )}

          {locationError && (
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
