import { StatelessAvatar } from "@/components/UserAvatar/StatelessAvatar";
import { COLORS } from "@/styles/colors";
import { Car, ChevronRight, MapPin } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { GetProps, Text, XStack, YStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";

interface Props extends GetProps<typeof XStack> {
  participant: ParticipantWithRoute;
  isMe: boolean;
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
    <XStack alignItems="center" gap="$1">
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
    <YStack alignItems="flex-end" gap="$1">
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

export default function ParticipantStatusCard({
  participant,
  isMe,
  onPress,
  ...rest
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
      {...rest}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }: { pressed: boolean }) => ({
          opacity: pressed ? 0.7 : 1,
          width: "100%",
        })}
      >
        <XStack alignItems="center" gap="$3" backgroundColor="$backgroundHover">
          {/* User Avatar */}
          <StatelessAvatar
            profilePicUrl={participant.photoURL || undefined}
            name={participant.displayName}
            size={40}
            backgroundColor={COLORS.primary}
          />

          {/* User Status Section */}
          <YStack flex={1} gap="$1">
            <XStack alignItems="center" gap="$2">
              <Text fontWeight="bold" fontSize="$4" color="$gray12">
                {participant.displayName}
              </Text>
              {isMe && (
                <Text
                  fontSize="$2"
                  color="$gray10"
                  backgroundColor="$gray3"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                  fontWeight="500"
                >
                  You
                </Text>
              )}
            </XStack>

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
