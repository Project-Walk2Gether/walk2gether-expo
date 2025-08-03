import { AlertCircle } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";

interface TravelTimeWarningProps {
  isLoading: boolean;
  canMakeIt: boolean;
  travelTimeMinutes: number;
  arrivalTimeBeforeStart: number;
  distanceText: string;
  error: string | null;
  onOpenMaps: () => void;
}

const TravelTimeWarning: React.FC<TravelTimeWarningProps> = ({
  isLoading,
  canMakeIt,
  travelTimeMinutes,
  arrivalTimeBeforeStart,
  distanceText,
  error,
  onOpenMaps,
}) => {
  if (isLoading) {
    return (
      <XStack
        backgroundColor="$backgroundHover"
        padding="$3"
        borderRadius="$4"
        alignItems="center"
        gap="$2"
      >
        <Spinner size="small" color="$blue10" />
        <Text>Checking travel time...</Text>
      </XStack>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  // Don't show anything if the user can make it in time
  if (canMakeIt) {
    return null;
  }

  // User can't make it in time, show warning
  return (
    <YStack
      backgroundColor="$yellow3"
      padding="$3"
      borderRadius="$4"
      gap="$2"
      marginBottom="$3"
    >
      <XStack alignItems="center" gap="$2">
        <AlertCircle size="$1" color="$yellow11" />
        <Text fontWeight="bold" color="$yellow11">
          Travel time warning
        </Text>
      </XStack>

      <Text>
        {arrivalTimeBeforeStart < 0
          ? `You'll arrive approximately ${Math.abs(
              arrivalTimeBeforeStart
            )} minutes after the walk starts.`
          : `You'll only arrive ${arrivalTimeBeforeStart} minutes before the walk starts.`}
      </Text>

      <Text>
        It takes about {travelTimeMinutes} minutes ({distanceText}) to get there
        by car.
      </Text>

      <Button
        backgroundColor="$yellow11"
        color="white"
        onPress={onOpenMaps}
        marginTop="$2"
      >
        Open in Maps
      </Button>
    </YStack>
  );
};

export default TravelTimeWarning;
