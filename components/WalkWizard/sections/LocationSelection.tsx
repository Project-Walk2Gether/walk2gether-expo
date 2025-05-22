import { FormInput } from "@/components/FormInput";
import LocationButton from "@/components/UI/LocationButton";
import { PlacesAutocomplete } from "@/components/UI/PlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { getRegionForRadius } from "@/utils/geo";
import { reverseGeocode } from "@/utils/locationUtils";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Text, View, YStack } from "tamagui";
import { findNearbyWalkers } from "./NeighborhoodConfirmationScreen/findNearbyWalkers";
import NearbyWalkersInfo from "./NeighborhoodConfirmationScreen/NearbyWalkersInfo";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const LocationSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData, setSystemErrors } = useWalkForm();

  // Local state for notes
  const [notes, setNotes] = useState<string>(
    formData.startLocation?.notes || ""
  );

  // Sync local notes to formData.startLocation.notes
  useEffect(() => {
    if (!formData.startLocation) return;
    if (formData.startLocation.notes !== notes) {
      updateFormData({
        startLocation: {
          ...formData.startLocation,
          notes,
        },
      });
    }
    // Only run when notes changes, not on every keystroke if not needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);
  const { user } = useAuth();
  const {
    refresh: getLocation,
    coords,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [nearbyWalkers, setNearbyWalkers] = useState(0);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);
  const [pendingLocationRequest, setPendingLocationRequest] = useState(false);
  const mapRef = useRef<MapView>(null);
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

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

      console.log({ newLocation });

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

  // Radius in meters for neighborhood walks
  const walkRadius = 700;

  // Find nearby walkers when the location is selected and it's a neighborhood walk
  useEffect(() => {
    const fetchNearbyWalkers = async () => {
      if (formData.type === "neighborhood" && formData.startLocation && user) {
        setIsLoadingNearbyUsers(true);

        const userLocation = {
          latitude: formData.startLocation.latitude,
          longitude: formData.startLocation.longitude,
        };

        try {
          const result = await findNearbyWalkers({
            user,
            userLocation,
            radiusKm: walkRadius / 1000,
          });

          setNearbyWalkers(result.nearbyUsersCount);

          // Store the userIds in formData if needed
          if (result.nearbyUserIds.length > 0) {
            updateFormData({ visibleToUserIds: result.nearbyUserIds });
          }
        } catch (error) {
          console.error("Error finding nearby walkers:", error);
          setNearbyWalkers(0);
        } finally {
          setIsLoadingNearbyUsers(false);
        }
      }
    };

    fetchNearbyWalkers();
  }, [formData.startLocation, formData.type, user, walkRadius]);

  const handleContinue = () => {
    if (formData.startLocation) {
      onContinue();
    }
  };

  console.log({ pendingLocationRequest, isReverseGeocoding });

  return (
    <WizardWrapper
      onContinue={handleContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueDisabled={!formData.startLocation}
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
              borderRadius: 10,
              paddingHorizontal: 15,
              fontSize: 16,
            }}
          />
        </View>
        <LocationButton
          onPress={async () => {
            setIsReverseGeocoding(true);

            try {
              // Set the flag to indicate we're waiting for location coordinates
              setPendingLocationRequest(true);

              // Call getLocation to update the location context
              await getLocation();

              // The useEffect will handle the coordinates when they are updated
              // This approach properly uses React's state management instead of setTimeout

              // If we already have coords and getLocation didn't trigger an update,
              // manually handle them (fallback)
              if (coords && pendingLocationRequest) {
                handleLocationCoordinates(
                  coords.latitude,
                  coords.longitude,
                  setIsReverseGeocoding
                );
                setPendingLocationRequest(false);
              }
            } catch (error) {
              console.error("Error getting current location:", error);
              setIsReverseGeocoding(false);
              setPendingLocationRequest(false);
            }
          }}
          disabled={locationLoading || isReverseGeocoding}
          loading={
            locationLoading || isReverseGeocoding || pendingLocationRequest
          }
        />
        <View
          flex={1}
          height={300}
          borderRadius={15}
          overflow="hidden"
          position="relative"
        >
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            key={formData.startLocation?.latitude}
            style={{ width: "100%", height: "100%" }}
            initialRegion={
              formData.startLocation
                ? formData.type === "neighborhood"
                  ? getRegionForRadius(
                      formData.startLocation.latitude,
                      formData.startLocation.longitude,
                      walkRadius
                    )
                  : {
                      latitude: formData.startLocation.latitude,
                      longitude: formData.startLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }
                : {
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            }
            onLongPress={handleMapLongPress}
          >
            {formData.startLocation && (
              <>
                <Marker
                  coordinate={{
                    latitude: formData.startLocation.latitude,
                    longitude: formData.startLocation.longitude,
                  }}
                  title={formData.startLocation.name}
                  description={formData.startLocation.name}
                  pinColor={COLORS.action}
                  tracksViewChanges={true} // Performance improvement
                />
                {/* Show circle radius for neighborhood walks */}
                {formData.type === "neighborhood" && (
                  <Circle
                    center={{
                      latitude: formData.startLocation.latitude,
                      longitude: formData.startLocation.longitude,
                    }}
                    radius={walkRadius}
                    strokeWidth={2}
                    strokeColor={COLORS.action + "80"}
                    fillColor={COLORS.action + "20"}
                  />
                )}
              </>
            )}
          </MapView>

          <Text color="white" fontSize={14} fontWeight="500" textAlign="center">
            Tap and hold on the map to choose a location
          </Text>

          {/* Display nearby walkers info for neighborhood walks */}
          {formData.type === "neighborhood" && formData.startLocation && (
            <View
              position="absolute"
              bottom={10}
              left={10}
              right={10}
              alignItems="center"
            >
              <NearbyWalkersInfo
                nearbyWalkers={nearbyWalkers}
                isLoadingNearbyUsers={isLoadingNearbyUsers}
              />
            </View>
          )}

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
        {/* Notes input field for location */}
        <FormInput
          label="Meetup location (optional)"
          placeholder="Add details about where to meet"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </YStack>
    </WizardWrapper>
  );
};

export default LocationSelection;
