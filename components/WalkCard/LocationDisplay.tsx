import { getDistanceToLocation } from "@/utils/locationUtils";
import { useUserData } from "@/context/UserDataContext";
import { Navigation } from "@tamagui/lucide-icons";
import React from "react";
import { Walk, WithId, walkIsNeighborhoodWalk } from "walk2gether-shared";
import { IconTextRow } from "./IconTextRow";

interface Props {
  walk: WithId<Walk>;
  userCoords?: { latitude: number; longitude: number } | null;
  locationLoading?: boolean;
  locationError?: string | undefined;
}

/**
 * Component to display location information and navigate button for a walk
 */
export const LocationDisplay: React.FC<Props> = ({
  walk,
  userCoords,
  locationLoading,
  locationError,
}) => {
  // Get user's preferred distance unit from userData
  const { userData } = useUserData();
  const distanceUnit = userData?.distanceUnit || "km";
  
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
      distanceUnit, // Pass the user's preferred distance unit
    });

    if (distance) {
      distanceText = ` (${distance})`;
    }
  }

  // Create the full display text
  const displayText = `${locationName}${distanceText}`;

  // If we don't have any location to display, return null
  if (!locationName) return null;

  // Display the location information
  return (
    <IconTextRow
      icon={<Navigation size={16} color="#444" />}
      text={displayText}
    />
  );
};
