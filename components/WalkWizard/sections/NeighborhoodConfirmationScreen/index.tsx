import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useWalkForm } from "@/context/WalkFormContext";
import React, { useEffect, useState } from "react";
import { YStack } from "tamagui";
import NeighborhoodWalkHowItWorksSection from "../NeighborhoodWalkHowItWorksSection";
import WizardWrapper from "../WizardWrapper";
import { findNearbyWalkers } from "./findNearbyWalkers";
import NearbyMembersMap from "./NearbyMembersMap";

interface NeighborhoodConfirmationProps {
  onSubmit: () => void;
  onBack: () => void;
}

// Radius in meters
const walkRadius = 700;

export const NeighborhoodConfirmationScreen: React.FC<
  NeighborhoodConfirmationProps
> = ({ onSubmit, onBack }) => {
  const { updateFormData } = useWalkForm();
  const { user } = useAuth();
  const {
    userLocation,
    loading: isLoadingLocation,
    error: locationError,
  } = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyWalkers, setNearbyWalkers] = useState(0);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);

  // Track if we're ready to display the screen
  const isLoading = isLoadingLocation || !userLocation;

  // Function to find nearby users within the radius
  const handleFindNearbyWalkers = async (userLocation: {
    latitude: number;
    longitude: number;
  }) => {
    const nearbyIds = await findNearbyWalkers({
      user,
      userLocation,
      radiusKm: walkRadius / 1000,
      setNearbyWalkers,
      setIsLoadingNearbyUsers,
    });

    // Update the form data with nearby user IDs
    updateFormData({
      visibleToUserIds: nearbyIds,
    });
  };

  useEffect(() => {
    if (userLocation && !isLoadingLocation) {
      // Create a location object to match the format expected by the form
      const locationData = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        name: "Current Location",
        description: "Your current location",
      };

      // Update the form data with the user's current location
      updateFormData({ startLocation: locationData });

      // Find nearby walkers when location is available
      handleFindNearbyWalkers({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
    } else if (locationError) {
      setErrorMsg(locationError);
    }
  }, [userLocation, isLoadingLocation, locationError]);

  return (
    <WizardWrapper
      onContinue={onSubmit}
      onBack={onBack}
      continueText="I am all set!"
    >
      <YStack gap="$4">
        <YStack justifyContent="flex-start" gap="$4">
          {/* Map with nearby members */}
          <NearbyMembersMap
            walkRadius={walkRadius}
            nearbyWalkers={nearbyWalkers}
            isLoadingNearbyUsers={isLoadingNearbyUsers}
          />

          {/* How it works section */}
          <NeighborhoodWalkHowItWorksSection />
        </YStack>
      </YStack>
    </WizardWrapper>
  );
};

export default NeighborhoodConfirmationScreen;
