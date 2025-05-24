import {
  getDistanceToLocation,
  openLocationInMaps,
} from "@/utils/locationUtils";
import { ArrowRight, Navigation } from "@tamagui/lucide-icons";
import React from "react";
import { Text, XStack, YStack } from "tamagui";
import { Walk, WithId, walkIsNeighborhoodWalk } from "walk2gether-shared";
import { IconTextRow } from "./IconTextRow";

interface Props {
  walk: WithId<Walk>;
  userCoords?: { latitude: number; longitude: number } | null;
  locationLoading?: boolean;
  locationError?: string | undefined;
  isApproved?: boolean;
  isMine?: boolean;
}

/**
 * Component to display location information and navigate button for a walk
 */
export const LocationDisplay: React.FC<Props> = ({
  walk,
  userCoords,
  locationLoading,
  locationError,
  isApproved = false,
  isMine = false,
}) => {
  if (walkIsNeighborhoodWalk(walk)) return null;

  // Extract the location name and remove city part for compact display
  const fullLocationName = walk.currentLocation?.name || "";
  // If the location contains a comma, only show the first part (typically the street address)
  const locationName = fullLocationName.split(",")[0] || fullLocationName;

  // Get distance information if available
  let distanceText = "";
  if (userCoords) {
    const distance = getDistanceToLocation({
      targetLocation: walk.currentLocation,
      userCoords: userCoords,
      loading: locationLoading,
      error: locationError,
    });

    if (distance) {
      distanceText = ` (${distance})`;
    }
  }

  // Create the full display text
  const displayText = `${locationName}${distanceText}`;

  // If we don't have any location to display, return null
  if (!locationName) return null;

  // Function to handle navigation to the location
  const handleNavigate = () => {
    if (walk.currentLocation?.latitude && walk.currentLocation?.longitude) {
      openLocationInMaps(
        walk.currentLocation.latitude,
        walk.currentLocation.longitude,
        walk.currentLocation.name
      );
    }
  };

  // Display the location information
  return (
    <YStack gap="$1.5">
      <IconTextRow
        onPress={handleNavigate}
        icon={<Navigation size={16} color="#999" />}
        text={
          <YStack>
            <Text color="#666">{displayText}</Text>
            {(isApproved || isMine) && (
              <XStack gap="$1">
                <Text color="#666">Navigate in Maps</Text>
                <ArrowRight size={16} color="#999" />
              </XStack>
            )}
          </YStack>
        }
      />
    </YStack>
  );
};
