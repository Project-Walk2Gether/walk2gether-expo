import { COLORS } from "@/styles/colors";
import ParticipantAvatar from "@/components/ParticipantAvatar";
import {
  getParticipantBorderColor,
  getParticipantOpacity,
  getParticipantStatusInfo,
} from "@/utils/participantStatus";
import { getWalkStatus } from "@/utils/walkUtils";
import { Car, ChevronRight, Footprints } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";

interface Props {
  participant: ParticipantWithRoute & { isInvitedParticipant?: boolean };
  walkStatus: ReturnType<typeof getWalkStatus>;
  currentUserId?: string;
  onPress?: (participant: ParticipantWithRoute) => void;
}

export default function ParticipantItem({
  participant,
  walkStatus,
  currentUserId,
  onPress,
}: Props) {
  const isCurrentUser = participant.userUid === currentUserId;
  const isInvited = participant.isInvitedParticipant ?? false;

  // Determine status information
  const statusInfo = isInvited
    ? { text: "Waiting for response", color: "$blue9" }
    : getParticipantStatusInfo(participant, walkStatus);

  // Determine border color and opacity
  const borderColor = isInvited
    ? "$blue7"
    : getParticipantBorderColor(participant, isCurrentUser);

  const opacity = isInvited ? 1 : getParticipantOpacity(participant);

  const notOnTheWay = participant.status === "pending";
  const showMarkOnTheWayButton = notOnTheWay && isCurrentUser;

  // Handle press event
  const handlePress = () => {
    onPress?.(participant);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={({ pressed }: { pressed: boolean }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <XStack
        padding="$2"
        gap="$2"
        alignItems="center"
        opacity={opacity}
        backgroundColor={showMarkOnTheWayButton ? COLORS.primary : isCurrentUser ? "$backgroundHover" : "white"}
        borderRadius="$4"
        borderWidth={1}
        borderColor={showMarkOnTheWayButton ? COLORS.primary : borderColor}
      >
        {/* Avatar */}
        <ParticipantAvatar
          photoURL={participant.photoURL}
          displayName={participant.displayName}
          size="$3"
        />
        <YStack gap="$1">
        {/* Top row: Name */}
        <XStack alignItems="center" gap="$1">
          <Text
            fontSize="$2"
            fontWeight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            flexShrink={1}
            color={showMarkOnTheWayButton ? COLORS.textOnDark : undefined}
          >
            {isCurrentUser ? "You" : participant.displayName}
          </Text>

          {participant.status === "on-the-way" &&
            (participant.navigationMethod === "driving" ? (
              <Car size={14} color={statusInfo.color} />
            ) : (
              <Footprints size={14} color={statusInfo.color} />
            ))}
          {participant.status === "on-the-way" && (
            <Text
              fontSize="$1"
              color={statusInfo.color}
              fontWeight="bold"
              flexShrink={1}
              numberOfLines={1}
            >
              {participant.navigationMethod === "driving"
                ? "(Driving)"
                : "(Walking)"}
            </Text>
          )}
        </XStack>

        {/* Status text */}
        <XStack alignItems="center" gap="$1">
          <Text
            fontSize="$1"
            color={showMarkOnTheWayButton ? COLORS.textOnDark : statusInfo.color}
            fontWeight="bold"
            flexShrink={1}
            numberOfLines={1}
          >
            {showMarkOnTheWayButton
              ? "Tell others I'm on the way"
              : statusInfo.text}
          </Text>
          {showMarkOnTheWayButton && (
            <ChevronRight size={16} color={COLORS.textOnDark} />
          )}
        </XStack>

        {/* Introduction text if available (only for regular participants) */}
        {!isInvited && participant.introduction && (
          <Text
            fontSize="$1"
            color="$gray10"
            fontStyle="italic"
            mt="$1"
            maxWidth="100%"
            flexShrink={1}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            "{participant.introduction}"
          </Text>
        )}
        </YStack>
      </XStack>
    </Pressable>
  );
}
