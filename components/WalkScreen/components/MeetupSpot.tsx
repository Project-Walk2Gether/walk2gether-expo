import { useRouter } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "tamagui";

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

const MeetupSpot: React.FC<Props> = ({
  location,
  isWalkOwner = false,
  walkId,
  isPending = false,
}) => {
  const router = useRouter();

  const handleEditLocation = () => {
    if (walkId) {
      router.push({
        pathname: "/(app)/(modals)/edit-walk-location",
        params: { id: walkId },
      });
    }
  };

  return (
    <>
      {/* Floating label above and to the right of the marker */}
      <Marker
        coordinate={{
          latitude: location.latitude + 0.0002, // Offset above the actual marker
          longitude: location.longitude + 0.0002, // Offset to the right of the actual marker
        }}
        anchor={{ x: 0, y: 1 }} // Anchor to bottom-left of label so it appears above and to the right
        tracksViewChanges={Platform.OS === "android"}
      >
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#000",
            }}
          >
            {isPending ? "New Meetup Location" : "Meetup Spot"}
          </Text>
        </View>
      </Marker>

      {/* Main marker */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        pinColor={isPending ? "rgba(255,165,0,0.9)" : "rgba(0,153,255,0.9)"}
        tracksViewChanges={Platform.OS === "android"}
      />
    </>
  );
};

export default MeetupSpot;
