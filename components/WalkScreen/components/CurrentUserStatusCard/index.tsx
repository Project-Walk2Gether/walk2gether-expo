import React from "react";
import { Pressable } from "react-native";
import { Text, Avatar, XStack, YStack } from "tamagui";
import { Car, MapPin, ChevronRight } from "@tamagui/lucide-icons";
import { COLORS } from "@/styles/colors";
import { ParticipantWithRoute } from "walk2gether-shared";

interface Props {
  participant: ParticipantWithRoute;
  isOwner: boolean;
  onPress: () => void;
}

// Helper function to render the status information based on participant status
const renderStatusInfo = (participant: ParticipantWithRoute) => {
  let icon = null;
  let label = "Not on the way yet";
  let color = "$gray10";
  
  if (participant.status === "on-the-way") {
    icon = <Car size={16} color={COLORS.primary} />;
    label = "On the way";
    color = COLORS.primary;
  } else if (participant.status === "arrived") {
    icon = <MapPin size={16} color="$blue9" />;
    label = "Arrived";
    color = "$blue9";
  }
  
  return (
    <XStack alignItems="center" space="$1">
      {icon}
      <Text fontSize="$3" color={color}>
        {label}
      </Text>
    </XStack>
  );
};

// Helper function to render distance and duration information
const renderDistanceInfo = (participant: ParticipantWithRoute) => {
  if (!participant?.route?.distance?.text) return null;
  
  return (
    <YStack alignItems="flex-end" space="$1">
      <Text fontSize="$3" color="$gray11" fontWeight="bold">
        {participant.route.distance.text}
      </Text>
      {participant.route.duration?.text && (
        <Text fontSize="$2" color="$gray9">
          {participant.route.duration.text}
        </Text>
      )}
    </YStack>
  );
};

export default function CurrentUserStatusCard({
  participant,
  isOwner,
  onPress
}: Props) {
  return (
    <XStack
      backgroundColor="white"
      borderRadius={12}
      // Using Tamagui's shadow props for better cross-platform shadows
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      overflow="hidden"
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }: { pressed: boolean }) => ({
          opacity: pressed ? 0.7 : 1,
          width: "100%"
        })}
      >
        <XStack
          padding="$3"
          alignItems="center"
          space="$3"
          backgroundColor="$backgroundHover"
        >
          {/* User Avatar */}
          <Avatar size="$4" circular>
            {participant.photoURL ? (
              <Avatar.Image
                source={{ uri: participant.photoURL }}
                width="100%"
                height="100%"
              />
            ) : (
              <Avatar.Fallback backgroundColor="$blue5">
                <Text color="white" fontSize="$3">
                  {participant.displayName?.[0] || "?"}
                </Text>
              </Avatar.Fallback>
            )}
          </Avatar>

          {/* User Status Section */}
          <YStack flex={1} space="$1">
            <Text fontWeight="bold" fontSize="$4" color="$gray12">
              My status
            </Text>

            {/* Render status info */}
            {renderStatusInfo(participant)}
          </YStack>

          {/* Distance and ETA */}
          {renderDistanceInfo(participant)}
          
          {/* Chevron indicator */}
          <ChevronRight size={16} color="$gray9" />
        </XStack>
      </Pressable>
    </XStack>
  );
}
