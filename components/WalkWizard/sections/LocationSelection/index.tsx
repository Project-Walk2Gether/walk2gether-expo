import LocationButton from "@/components/UI/LocationButton";
import { useWalkForm } from "@/context/WalkFormContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, YStack } from "tamagui";
import WizardWrapper, { WizardWrapperHandle } from "../WizardWrapper";

// Import custom hooks
import useLocationSelection from "./hooks/useLocationSelection";
import useNearbyWalkers from "./hooks/useNearbyWalkers";
import useSavedLocations from "./hooks/useSavedLocations";

// Import sub-components
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import LocationNotes from "./LocationNotes";
import LocationSearchSection from "./LocationSearchSection";
import MapSection from "./MapSection";

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
  const { formData, updateFormData } = useWalkForm();

  // Local state for notes
  const [notes, setNotes] = useState<string>(
    formData.startLocation?.notes || ""
  );

  // Reference to the WizardWrapper component to control scrolling
  const wizardWrapperRef = useRef<WizardWrapperHandle>(null);

  // Custom hooks
  const {
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
  } = useLocationSelection();

  // Fetch saved locations
  const { savedLocations, loadingSavedLocations } = useSavedLocations();

  // Radius in meters for neighborhood walks
  const walkRadius = 700;

  // Memoize location coordinates to prevent unnecessary recalculations for nearby walkers hook
  const memoizedLocationCoords = useMemo(
    () =>
      formData.startLocation
        ? {
            latitude: formData.startLocation.latitude,
            longitude: formData.startLocation.longitude,
          }
        : null,
    [formData.startLocation?.latitude, formData.startLocation?.longitude]
  );

  // Memoize the complete startLocation object for the MapSection component
  const memoizedStartLocation = useMemo(
    () =>
      formData.startLocation
        ? {
            latitude: formData.startLocation.latitude,
            longitude: formData.startLocation.longitude,
            name: formData.startLocation.name || "",
          }
        : null,
    [
      formData.startLocation?.latitude,
      formData.startLocation?.longitude,
      formData.startLocation?.name,
    ]
  );

  // Memoize walk type to prevent unnecessary recalculations
  const memoizedWalkType = useMemo(() => formData.type || "", [formData.type]);

  // Get nearby walkers info for neighborhood walks
  const { nearbyWalkers, isLoadingNearbyUsers } = useNearbyWalkers({
    startLocation: memoizedLocationCoords,
    walkType: memoizedWalkType,
    radiusInMeters: walkRadius,
  });

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

  // Function to handle focus on the meetup location input
  const handleMeetupLocationFocus = () => {
    // Scroll to the bottom of the scroll view when the meetup location input is focused
    setTimeout(() => {
      wizardWrapperRef.current?.scrollToEnd();
    }, 100); // Small delay to ensure the keyboard is showing first
  };

  const handleContinue = () => {
    if (formData.startLocation) {
      onContinue();
    }
  };

  return (
    <WizardWrapper
      ref={wizardWrapperRef}
      onContinue={handleContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueDisabled={!formData.startLocation}
    >
      <YStack space="$4">
        {/* Search section */}
        <LocationSearchSection
          googlePlacesRef={
            googlePlacesRef as React.RefObject<GooglePlacesAutocompleteRef>
          }
          onSelect={handleLocationSelect}
        />

        {/* Current location button */}
        <LocationButton
          onPress={handleCurrentLocation}
          disabled={locationLoading || isReverseGeocoding}
          loading={
            locationLoading || isReverseGeocoding || pendingLocationRequest
          }
        />

        {/* <SavedLocationsList
          locations={savedLocations || []}
          loading={loadingSavedLocations}
          onSelectLocation={handleLocationCoordinates}
        /> */}

        <Text>Or long-press on the map to choose a location</Text>

        {/* Map section */}
        <MapSection
          mapRef={mapRef as any}
          startLocation={memoizedStartLocation}
          walkType={memoizedWalkType}
          walkRadius={walkRadius}
          handleMapLongPress={handleMapLongPress}
          isReverseGeocoding={isReverseGeocoding}
          longPressActive={longPressActive}
          locationLoading={locationLoading}
          locationError={locationError || null}
          nearbyWalkers={nearbyWalkers}
          isLoadingNearbyUsers={isLoadingNearbyUsers}
        />

        {/* Notes section */}
        <LocationNotes
          notes={notes}
          setNotes={setNotes}
          onFocus={handleMeetupLocationFocus}
        />
      </YStack>
    </WizardWrapper>
  );
};

export default LocationSelection;
