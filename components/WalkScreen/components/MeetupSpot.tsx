import React from "react";
import { Platform } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { Button, Text, YStack } from "tamagui";
import { Edit3 } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    notes?: string;
    displayName?: string;
  };
  isWalkOwner?: boolean;
  walkId?: string;
  isPending?: boolean;
}

const MeetupSpot: React.FC<Props> = ({ location, isWalkOwner = false, walkId, isPending = false }) => {
  const router = useRouter();
  
  const handleEditLocation = () => {
    if (walkId) {
      router.push({
        pathname: "/(app)/(modals)/edit-walk-location",
        params: { id: walkId }
      });
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      pinColor={isPending ? "rgba(255,165,0,0.9)" : "rgba(0,153,255,0.9)"}
      tracksViewChanges={Platform.OS === "android"}
    >
      <Callout tooltip={false}>
        <YStack padding="$2" minWidth={200} alignItems="center">
          <Text fontSize="$4" fontWeight="600" marginBottom="$1">
            {isPending ? "New Meetup Location (Pending)" : "Meetup Spot"}
          </Text>
          {location.notes && (
            <Text fontSize="$3" color="$gray11" textAlign="center" marginBottom="$2">
              {location.notes}
            </Text>
          )}
          {isPending && (
            <Text fontSize="$2" color="$orange10" textAlign="center" marginBottom="$2">
              Tap 'Update meetup location' to confirm
            </Text>
          )}
          {isWalkOwner && !isPending && walkId && (
            <Button
              size="$2"
              backgroundColor="$blue9"
              color="white"
              icon={<Edit3 size={14} />}
              onPress={handleEditLocation}
            >
              Edit Location
            </Button>
          )}
        </YStack>
      </Callout>
    </Marker>
  );
};

export default MeetupSpot;
