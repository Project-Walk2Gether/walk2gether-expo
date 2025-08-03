import LocationButton from "@/components/UI/LocationButton";
import { useSheet } from "@/context/SheetContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { Button, YStack } from "tamagui";
import { Bookmark } from "@tamagui/lucide-icons";
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
import SavedLocationsSheet from "./SavedLocationsSheet";
import TravelTimeWarning from "./TravelTimeWarning";

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
  const { showSheet, hideSheet } = useSheet();

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
    userMayNotMakeItToStartLocationInTime,
    isTravelTimeLoading,
    travelTimeInfo,
  } = useLocationSelection();

  // Fetch saved locations
  const { savedLocations, loadingSavedLocations } = useSavedLocations();

  // Radius in meters for neighborhood walks
  const walkRadius = 700;

  // Extract location coordinates for nearby walkers hook
  const locationCoords = formData.startLocation
    ? {
        latitude: formData.startLocation.latitude,
        longitude: formData.startLocation.longitude,
      }
    : null;

  // Extract startLocation object for the MapSection component
  const startLocation = formData.startLocation
    ? {
        latitude: formData.startLocation.latitude,
        longitude: formData.startLocation.longitude,
        name: formData.startLocation.name || "",
      }
    : null;

  // Get walk type
  const walkType = formData.type || "";

  // Get nearby walkers info for neighborhood walks
  const { nearbyWalkers, isLoadingNearbyUsers } = useNearbyWalkers({
    startLocation: locationCoords,
    walkType: walkType,
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

  // Handle continue button press
  const handleContinue = () => {
    // Show alert if user may not make it to the start location in time
    if (userMayNotMakeItToStartLocationInTime && travelTimeInfo) {
      Alert.alert(
        "Travel Time Warning",
        `You may not make it to the walk on time. It takes about ${
          travelTimeInfo.travelTimeMinutes
        } minutes (${travelTimeInfo.route.distance.text}) to get there by car.${
          travelTimeInfo.arrivalTimeBeforeStart < 0
            ? ` You'll arrive approximately ${Math.abs(
                travelTimeInfo.arrivalTimeBeforeStart
              )} minutes after the walk starts.`
            : ` You'll only arrive ${travelTimeInfo.arrivalTimeBeforeStart} minutes before the walk starts.`
        }

Do you still want to continue?`,
        [
          { text: "Open Maps", onPress: handleOpenMaps },
          { text: "Cancel", style: "cancel" },
          { text: "Continue Anyway", onPress: () => onContinue() },
        ]
      );
    } else {
      // Continue normally if no travel time warning
      onContinue();
    }
  };

  // Handle opening maps app with directions
  const handleOpenMaps = () => {
    if (!formData.startLocation) return;

    const destination = `${formData.startLocation.latitude},${formData.startLocation.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  // Handle saved location selection
  const handleSavedLocationSelect = (favoriteLocation: any) => {
    const newLocation = {
      name: favoriteLocation.location.name || "Saved Location",
      latitude: favoriteLocation.location.latitude,
      longitude: favoriteLocation.location.longitude,
      notes: favoriteLocation.location.notes,
    };
    updateFormData({ startLocation: newLocation });
  };

  // Handle deleting a saved location
  const handleDeleteSavedLocation = (deletedLocation: any) => {
    // The useQuery hook should automatically refresh the list
    // No additional action needed as the hook will detect the deletion
  };

  // Handle opening saved locations sheet
  const handleOpenSavedLocations = () => {
    showSheet(
      <SavedLocationsSheet
        locations={savedLocations}
        loading={loadingSavedLocations}
        onSelectLocation={handleSavedLocationSelect}
        onDeleteLocation={handleDeleteSavedLocation}
        onClose={hideSheet}
      />
    );
  };

  return (
    <WizardWrapper
      ref={wizardWrapperRef}
      onContinue={handleContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueDisabled={!formData.startLocation || isTravelTimeLoading}
      isLoading={isTravelTimeLoading}
    >
      <YStack gap="$4">
        {/* Sections with horizontal padding */}
        <YStack gap="$4" paddingHorizontal={16}>
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
          
          {/* Saved locations button */}
          {savedLocations && savedLocations.length > 0 && (
            <Button
              size="$4"
              backgroundColor={COLORS.card}
              borderColor={COLORS.border}
              borderWidth={1}
              color={COLORS.text}
              icon={Bookmark}
              onPress={handleOpenSavedLocations}
              disabled={loadingSavedLocations}
            >
              {loadingSavedLocations 
                ? "Loading saved locations..." 
                : `Choose from ${savedLocations.length} saved location${savedLocations.length === 1 ? '' : 's'}`
              }
            </Button>
          )}
        </YStack>

        {/* Sections with horizontal padding */}
        <YStack gap="$4" paddingHorizontal={16}>
          {/* Map section */}
          <MapSection
            mapRef={mapRef as any}
            startLocation={startLocation}
            walkType={walkType}
            walkRadius={walkRadius}
            handleMapLongPress={handleMapLongPress}
            isReverseGeocoding={isReverseGeocoding}
            longPressActive={longPressActive}
            locationLoading={locationLoading}
            locationError={locationError || null}
            nearbyWalkers={nearbyWalkers}
            isLoadingNearbyUsers={isLoadingNearbyUsers}
          />

          {/* Travel time warning */}
          {travelTimeInfo && userMayNotMakeItToStartLocationInTime && (
            <TravelTimeWarning
              isLoading={isTravelTimeLoading}
              canMakeIt={!userMayNotMakeItToStartLocationInTime}
              travelTimeMinutes={travelTimeInfo.travelTimeMinutes}
              arrivalTimeBeforeStart={travelTimeInfo.arrivalTimeBeforeStart}
              distanceText={travelTimeInfo.route.distance.text}
              error={null}
              onOpenMaps={handleOpenMaps}
            />
          )}

          {/* Notes section */}
          <LocationNotes
            notes={notes}
            setNotes={setNotes}
            onFocus={handleMeetupLocationFocus}
          />
        </YStack>
      </YStack>
    </WizardWrapper>
  );
};

export default LocationSelection;
