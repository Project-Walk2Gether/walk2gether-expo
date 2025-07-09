import { Pin } from "@tamagui/lucide-icons";
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Text, XStack, YStack } from "tamagui";
import { COLORS } from "../../../styles/colors";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    notes?: string;
  };
  isWalkOwner?: boolean;
  walkId?: string;
}

const MeetupSpot: React.FC<Props> = ({ location }) => {
  const displayText = location.notes || "Meetup Spot";

  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      anchor={{ x: 0.5, y: 1 }}
      centerOffset={{ x: 0, y: -18 }}
      tracksViewChanges={false}
    >
      <YStack>
        <YStack
          backgroundColor="white"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          borderColor={COLORS.success}
          shadowColor="#000"
          shadowOpacity={0.25}
          shadowRadius={3}
          alignItems="center"
          marginBottom="$2"
          borderWidth={2}
          maxWidth={200}
          zIndex={10}
          style={{
            shadowOffset: { width: 0, height: 2 },
            elevation: 5,
          }}
        >
          {/* Label */}
          <XStack gap="$2">
            <Pin color="$black" size={14} />
            <Text fontSize={11} fontWeight="bold" color={COLORS.text}>
              MEETUP SPOT
            </Text>
          </XStack>

          <Text fontSize={14} color={COLORS.text} textAlign="center">
            {displayText}
          </Text>
        </YStack>

        {/* Pin head and stem */}
        <View
          style={{
            alignItems: "center",
          }}
        >
          {/* Pin stem */}
          <View
            style={{
              width: 6,
              height: 16,
              backgroundColor: COLORS.success,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              marginTop: -3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 4,
            }}
          />
        </View>
      </YStack>
    </Marker>
  );
};

export default MeetupSpot;
