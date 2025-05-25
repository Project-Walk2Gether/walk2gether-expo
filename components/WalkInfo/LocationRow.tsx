import { openLocationInMaps } from "@/utils/locationUtils";
import { MapPin, Navigation } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Text, XStack, YStack } from "tamagui";

interface Props {
  locationName?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export function LocationRow({
  locationName,
  notes,
  latitude,
  longitude,
}: Props) {
  const hasCoordinates = !!latitude && !!longitude;

  return (
    <XStack
      width="100%"
      alignItems="center"
      justifyContent="space-between"
      gap="$2"
    >
      <MapPin size={15} color="white" />
      <YStack flex={1} gap="$1">
        <Text color="white" fontSize="$3" fontWeight="bold">
          {locationName || "Meetup Point"}
        </Text>

        {notes && (
          <Text color="white" fontSize="$2">
            {notes}
          </Text>
        )}
      </YStack>

      {hasCoordinates && (
        <Button
          size="$1"
          icon={<Navigation size={15} color="white" />}
          onPress={() => {
            openLocationInMaps(latitude, longitude, locationName);
          }}
          accessibilityLabel="Navigate to meetup location"
          color="white"
          backgroundColor="$blue10"
          paddingHorizontal="$2"
        >
          Navigate
        </Button>
      )}
    </XStack>
  );
}
