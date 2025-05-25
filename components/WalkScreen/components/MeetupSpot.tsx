import { Info, Pencil } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
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

const MeetupSpot: React.FC<Props> = ({
  location,
  isWalkOwner = false,
  walkId,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Format address to exclude city information
  const formatAddress = (address: string | undefined): string => {
    if (!address) return "Meetup Spot";

    // Split by commas and only use the first part (usually street address)
    const parts = address.split(",");
    return parts[0].trim();
  };

  const address = formatAddress(location.name);
  const notes = location.notes || "";

  // Function to show the full notes in a dialog
  const handlePress = () => {
    setDialogOpen(true);
  };

  // Function to navigate to edit screen
  const handleEditPress = () => {
    if (walkId) {
      router.push({
        pathname: "/edit-walk",
        params: { id: walkId },
      });
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      anchor={{ x: 0.5, y: 1 }}
      centerOffset={{ x: 0, y: -18 }}
      onPress={handlePress}
      tracksViewChanges={false}
    >
      <YStack alignItems="center">
        {/* Label */}
        <XStack
          backgroundColor="white"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          alignItems="center"
          marginBottom="$2"
          borderWidth={2}
          borderColor={COLORS.success}
          shadowColor="#000"
          shadowOpacity={0.25}
          shadowRadius={3}
          style={{
            shadowOffset: { width: 0, height: 2 },
            elevation: 5,
          }}
        >
          <YStack alignItems="center" gap="$1" width="100%">
            {/* Main display text - prioritize notes if available */}
            <Text
              fontSize={14}
              fontWeight="bold"
              color={COLORS.text}
              textAlign="center"
            >
              {notes || address}
            </Text>

            {/* Action line */}
            <XStack
              gap="$1"
              alignItems="center"
              justifyContent="center"
              width="100%"
            >
              <TouchableOpacity
                onPress={handlePress}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text fontSize={12} color={COLORS.primary} fontWeight="bold">
                  Meetup spot
                </Text>
                <Info
                  size={14}
                  color={COLORS.primary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              {/* Edit button for walk owner */}
              {isWalkOwner && walkId ? (
                <TouchableOpacity
                  onPress={handleEditPress}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 12,
                    paddingLeft: 12,
                    borderLeftWidth: 1,
                    borderLeftColor: COLORS.border,
                  }}
                >
                  <Text fontSize={12} color={COLORS.action} fontWeight="bold">
                    Edit
                  </Text>
                  <Pencil
                    size={14}
                    color={COLORS.action}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              ) : null}
            </XStack>
          </YStack>
        </XStack>

        {/* Pin head and stem */}
        <View
          style={{
            alignItems: "center",
          }}
        >
          {/* Pin head - large, unmissable circle */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.success,
              borderWidth: 4,
              borderColor: "white",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 6,
              zIndex: 2,
            }}
          />

          {/* Pin stem */}
          <View
            style={{
              width: 6,
              height: 16,
              backgroundColor: COLORS.success,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              marginTop: -3,
              zIndex: 1,
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
