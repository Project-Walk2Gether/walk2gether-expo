import { COLORS } from "@/styles/colors";
import React from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import { Participant, Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";

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
  acceptedParticipants,
  requestedParticipants,
  avatarsToDisplay,
  overflow,
}) => {
  const isFriendsWalk = walkIsFriendsWalk(walk);

  // Get the list of all participant names from accepted participants
  const participantNames = acceptedParticipants.map(p => p.displayName || "Someone");

  // Format the names in sentence case with a proper message
  const formattedParticipantNames = participantNames.length > 0
    ? `${formatNamesInSentenceCase(participantNames)} ${participantNames.length > 1 ? 'are' : 'is'} going`
    : "No one has joined yet";

  return (
    <YStack 
      borderTopWidth={1} 
      borderTopColor="$gray4"
      mt={12}
      pt={12}
      gap={16} 
      flex={1}>
      <XStack flex={1} alignItems="center">
        {/* Only show avatars for participants (excluding organizer) */}
        <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
          {avatarsToDisplay.length > 0 ? (
            <>
              {avatarsToDisplay.map((participant, index) => (
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
              {overflow > 0 && (
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
                  >{`+${overflow}`}</Text>
                </View>
              )}
            </>
          ) : (
            acceptedParticipants.length === 0 && (
              <Text fontSize={14} color="#666">
                {walkIsFriendsWalk(walk) ? "No friends joined yet" : "No neighbors joined yet"}
              </Text>
            )
          )}
        </XStack>
        
        {/* Display all participant names in sentence case */}
        {avatarsToDisplay.length > 0 && (
          <Text fontSize={14} color="#666" ml={10} flex={1}>
            {formattedParticipantNames}
          </Text>
        )}
      </XStack>
    </YStack>
  );
};
