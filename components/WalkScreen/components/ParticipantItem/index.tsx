import { COLORS } from "@/styles/colors";
import {
  getParticipantBorderColor,
  getParticipantOpacity,
  getParticipantStatusInfo,
} from "@/utils/participantStatus";
import { getWalkStatus } from "@/utils/walkUtils";
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

  // Handle invited participants differently
  if (participant.isInvitedParticipant) {
    return (
      <XStack
        padding="$2"
        margin="$1"
        gap="$2"
        alignItems="center"
        pressStyle={{ scale: 0.98 }}
        animation="quick"
        borderRadius="$4"
        backgroundColor="white"
        borderWidth={1}
        borderColor="$blue7"
        opacity={1}
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

          {/* Bottom row: Status text */}
          <Text
            fontSize="$1"
            color="$blue9"
            fontWeight="bold"
            flexShrink={1}
            numberOfLines={1}
          >
            Waiting for response
          </Text>
        </YStack>
      </XStack>
    );
  }

  // Regular participant
  const statusInfo = getParticipantStatusInfo(participant, walkStatus);
  const statusText = statusInfo.text;
  const statusColor = statusInfo.color;

  // Only allow pressing participants that are not the current user
  const handlePress = () => {
    if (!isCurrentUser && onPress) {
      onPress(participant);
    }
  };

  return (
    <XStack
      onPress={isCurrentUser ? undefined : handlePress}
      padding="$2"
      margin="$1"
      gap="$2"
      mb="$2"
      alignItems="center"
      pressStyle={{ scale: 0.98 }}
      animation="quick"
      borderRadius="$4"
      backgroundColor="white"
      borderWidth={1}
      borderColor={getParticipantBorderColor(participant, isCurrentUser)}
      opacity={getParticipantOpacity(participant)}
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
        {/* Status text with ETA */}
        <XStack alignItems="center" gap="$1">
          <Text
            fontSize="$1"
            color={statusColor}
            fontWeight="bold"
            flexShrink={1}
            numberOfLines={1}
          >
            {statusText}
          </Text>
        </XStack>

        {/* Introduction text if available */}
        {participant.introduction && (
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
