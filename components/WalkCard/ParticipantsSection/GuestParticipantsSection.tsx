import { COLORS } from "@/styles/colors";
import React from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";

/**
 * Format an array of names into a sentence case string (e.g., "Mary, Sue and Bob")
 */
const formatNamesInSentenceCase = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  // For 3+ names: "Name1, Name2, ... and NameN"
  const lastIndex = names.length - 1;
  const firstPart = names.slice(0, lastIndex).join(", ");
  return `${firstPart} and ${names[lastIndex]}`;
};

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  acceptedParticipants: WithId<Participant>[];
  requestedParticipants: WithId<Participant>[];
  invitedParticipants: WithId<Participant>[];
  notifiedParticipants: WithId<Participant>[];
  deniedParticipants: WithId<Participant>[];
  cancelledParticipants: WithId<Participant>[];
  avatarsToDisplay: WithId<Participant>[];
  overflow: number;
}

/**
 * Participants section shown to guests (non-owners) of the walk
 */
export const GuestParticipantsSection: React.FC<Props> = ({
  walk,
  currentUserUid,
  acceptedParticipants,
  requestedParticipants,
  avatarsToDisplay,
  overflow,
}) => {
  const isFriendsWalk = walkIsFriendsWalk(walk);
  const ownerName = walk.organizerName || "the organizer";

  // Filter out the owner from avatars (since owner's avatar is already shown in card header)
  const nonOwnerAvatarsToDisplay = avatarsToDisplay.filter(
    (participant) => participant.userUid !== walk.createdByUid
  );

  // Adjust overflow count if we filtered out the owner
  const adjustedOverflow =
    nonOwnerAvatarsToDisplay.length < avatarsToDisplay.length
      ? Math.max(0, overflow - 1)
      : overflow;

  // Get the list of participant names including the owner
  const nonOwnerParticipantNames = acceptedParticipants
    .filter((p) => p.userUid !== walk.createdByUid)
    .map((p) => p.displayName || "Someone");

  // Create a combined list that includes the owner's name at the end
  const allParticipantNames = [...nonOwnerParticipantNames];
  if (!allParticipantNames.includes(ownerName)) {
    allParticipantNames.push(ownerName);
  }

  // Check if current user is a participant
  const isCurrentUserParticipant =
    currentUserUid &&
    walk.participantsById &&
    walk.participantsById[currentUserUid] &&
    walk.participantsById[currentUserUid].acceptedAt;

  // Format the message based on number of participants
  let participantMessage;
  if (nonOwnerParticipantNames.length === 0) {
    if (isCurrentUserParticipant) {
      // Only the owner and current user are going
      participantMessage = `You and ${ownerName} on the walk`;
    } else {
      // Only the owner is going
      participantMessage = `Be the first to join ${ownerName}`;
    }
  } else {
    // Create participants list based on whether current user is included
    let displayNames = [...allParticipantNames];

    if (isCurrentUserParticipant) {
      // Add "you" to the list if the current user is a participant
      // First filter out the current user's name if it's in the list
      displayNames = displayNames.filter((name) => {
        const participant =
          walk.participantsById && walk.participantsById[currentUserUid];
        return participant && name !== participant.displayName;
      });

      // Add "you" to the beginning
      displayNames.unshift("You");

      // Owner and others including current user are going
      participantMessage = `${formatNamesInSentenceCase(
        displayNames
      )} on the walk`;
    } else {
      // Owner and others (not including current user) are going
      participantMessage = `${formatNamesInSentenceCase(
        displayNames
      )} on the walk`;
    }
  }

  return (
    <YStack borderTopWidth={1} borderTopColor="$gray4" mt={12} pt={12} gap={16}>
      <XStack alignItems="center">
        {/* Only show avatars for participants (excluding organizer) */}
        <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
          {nonOwnerAvatarsToDisplay.length > 0 ? (
            <>
              {nonOwnerAvatarsToDisplay.map((participant, index) => (
                <Avatar
                  key={participant.id || index}
                  size={32}
                  circular
                  borderColor="white"
                  borderWidth={2}
                >
                  <Avatar.Image src={participant.photoURL || undefined} />
                  <Avatar.Fallback
                    justifyContent="center"
                    alignItems="center"
                    backgroundColor={COLORS.primary}
                  >
                    <Text color="white">
                      {(participant.displayName || "A").charAt(0).toUpperCase()}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
              ))}
              {adjustedOverflow > 0 && (
                <View
                  backgroundColor={COLORS.primary}
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  borderColor="white"
                  borderWidth={2}
                >
                  <Text
                    fontSize={11}
                    color="white"
                    fontWeight="bold"
                  >{`+${adjustedOverflow}`}</Text>
                </View>
              )}
            </>
          ) : (
            acceptedParticipants.length === 0 && (
              <Text fontSize={14} color="#666">
                {walkIsFriendsWalk(walk)
                  ? "No friends joined yet"
                  : "No neighbors joined yet"}
              </Text>
            )
          )}
        </XStack>

        {/* Display all participant names in sentence case */}
        <Text fontSize={14} color="#666" ml={10} flex={1}>
          {participantMessage}
        </Text>
      </XStack>
    </YStack>
  );
};
