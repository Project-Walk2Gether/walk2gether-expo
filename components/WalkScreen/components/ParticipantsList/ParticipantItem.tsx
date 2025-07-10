import { COLORS } from "@/styles/colors";
import {
  getParticipantBorderColor,
  getParticipantOpacity,
  getParticipantStatusInfo,
} from "@/utils/participantStatus";
import { getWalkStatus } from "@/utils/walkUtils";
import { Car, Footprints } from "@tamagui/lucide-icons";
import React from "react";
import { Avatar, Text, XStack, YStack } from "tamagui";
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

  // Only allow pressing participants that are not the current user
  const handlePress = () => {
    onPress?.(participant);
  };

  return (
    <XStack
      onPress={handlePress}
      padding="$2"
      gap="$2"
      alignItems="center"
      pressStyle={{ scale: 0.98 }}
      animation="quick"
      borderRadius="$4"
      backgroundColor="white"
      borderWidth={1}
      borderColor={borderColor}
      opacity={opacity}
    >
      {/* Avatar */}
      <Avatar circular size="$3">
        {participant.photoURL ? (
          <Avatar.Image src={participant.photoURL} />
        ) : (
          <Avatar.Fallback
            justifyContent="center"
            alignItems="center"
            backgroundColor={COLORS.primary}
          >
            <Text color="white" fontSize="$2">
              {participant.displayName?.charAt(0).toUpperCase()}
            </Text>
          </Avatar.Fallback>
        )}
      </Avatar>
      <YStack gap="$1">
        {/* Top row: Name */}
        <XStack alignItems="center" gap="$1">
          <Text
            fontSize="$2"
            fontWeight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            flexShrink={1}
          >
            {isCurrentUser ? "You" : participant.displayName}
          </Text>
        </XStack>

        {/* Status text */}
        <XStack alignItems="center" gap="$1">
          {participant.status === "on-the-way" &&
            (participant.navigationMethod === "driving" ? (
              <Car size={14} color={statusInfo.color} />
            ) : (
              <Footprints size={14} color={statusInfo.color} />
            ))}
          <Text
            fontSize="$1"
            color={statusInfo.color}
            fontWeight="bold"
            flexShrink={1}
            numberOfLines={1}
          >
            {statusInfo.text}
          </Text>
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
  );
}
