import { ChevronRight, Edit3, MapPin } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { Button, YStack } from "tamagui";
import { Location } from "walk2gether-shared";
import WalkDetailsCard from "../WalkDetailsCard";
import WalkDetailsRow from "../WalkDetailsRow";

interface Props {
  startLocation?: Location | null;
  currentLocation?: Location | null;
  walkId?: string;
  hasMeetupSpotPhoto?: boolean;
  showEditButton?: boolean;
}

export default function LocationCard({
  startLocation,
  currentLocation,
  walkId,
  hasMeetupSpotPhoto,
  showEditButton = false,
}: Props) {
  const location = startLocation || currentLocation;
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
          <WalkDetailsRow icon={<MapPin />} label="No location specified" />
        </YStack>
      </WalkDetailsCard>
    );
  }

  // Display location info
  const displayName = location?.name || "Meeting point";

  return (
    <WalkDetailsCard
      title="Location"
      headerAction={
        showEditButton && walkId ? (
          <Button
            mt="$2"
            size="$2"
            theme="blue"
            onPress={() =>
              router.push(`/(modals)/edit-walk-location?id=${walkId}` as any)
            }
            iconAfter={<Edit3 />}
          >
            Edit
          </Button>
        ) : undefined
      }
    >
      <YStack w="100%" gap="$3">
        <WalkDetailsRow
          icon={<MapPin />}
          label={displayName}
          sublabel={location?.notes}
        />

        {/* Display additional notes if available */}
        {location?.displayName && location.displayName !== displayName && (
          <WalkDetailsRow label={location.displayName} icon={null} />
        )}

        {/* Go to map button below location info */}
        <Button
          size="$3"
          theme="blue"
          onPress={handleGoToMap}
          iconAfter={<ChevronRight />}
          alignSelf="flex-start"
        >
          Go to map
        </Button>
      </YStack>
    </WalkDetailsCard>
  );
}
