import React from "react";
import { router } from "expo-router";
import { MapPin } from "@tamagui/lucide-icons";
import { Button, YStack } from "tamagui";
import WalkDetailsCard from "../WalkDetailsCard";
import WalkDetailsRow from "../WalkDetailsRow";
import { Location } from "walk2gether-shared";
import Badge from "@/components/Badge";

interface Props {
  startLocation?: Location | null;
  currentLocation?: Location | null;
  walkId?: string;
  hasMeetupSpotPhoto?: boolean;
}

export default function LocationCard({
  startLocation,
  currentLocation,
  walkId,
  hasMeetupSpotPhoto,
}: Props) {
  const location = currentLocation || startLocation;
  const hasLocationInfo = !!(
    location &&
    location.latitude &&
    location.longitude
  );

  const handleGoToMap = () => {
    if (walkId) {
      // Use the correct path format for expo-router
      router.push(`/walks/${walkId}/meet`);
    }
  };

  if (!hasLocationInfo) {
    return (
      <WalkDetailsCard title="Location">
        <YStack w="100%" alignItems="center" p="$2">
          <WalkDetailsRow
            icon={<MapPin />}
            label="No location specified"
          />
        </YStack>
      </WalkDetailsCard>
    );
  }

  // Display location info
  const displayName = location?.name || "Meeting point";
  
  return (
    <WalkDetailsCard 
      title="Location"
      headerAction={hasMeetupSpotPhoto ? <Badge label="Meetup spot" /> : undefined}
    >
      <YStack w="100%" space="$3">
        <WalkDetailsRow
          icon={<MapPin />}
          label={displayName}
          sublabel={location?.notes}
        />
        
        {/* Display additional notes if available */}
        {location?.displayName && location.displayName !== displayName && (
          <WalkDetailsRow
            label={location.displayName}
            icon={null}
          />
        )}

        {/* Show action button to navigate to map */}
        <Button 
          mt="$2"
          size="$3"
          theme="blue"
          onPress={handleGoToMap}
        >
          Go to map
        </Button>
      </YStack>
    </WalkDetailsCard>
  );
}
