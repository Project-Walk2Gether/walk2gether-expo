import { COLORS } from "@/styles/colors";
import React, { useMemo } from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";
import { formatGuestParticipantMessage } from "./participantMessageUtils";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  acceptedParticipants: WithId<Participant>[];
}

/**
 * Participants section shown to guests (non-owners) of the walk
 */
export const GuestParticipantsSection: React.FC<Props> = ({
  walk,
  currentUserUid,
  acceptedParticipants,
}) => {
  const ownerName = walk.organizerName || "the organizer";
  
  // Calculate avatars to display and overflow
  const { displayAvatars, overflow } = useMemo(() => {
    const maxAvatars = 5;
    
    // Filter out the owner from avatars (since owner's avatar is already shown in card header)
    const nonOwnerParticipants = acceptedParticipants.filter(
      (participant) => participant.userUid !== walk.createdByUid
    );
    
    return {
      displayAvatars: nonOwnerParticipants.slice(0, maxAvatars),
      overflow: Math.max(0, nonOwnerParticipants.length - maxAvatars)
    };
  }, [acceptedParticipants, walk.createdByUid]);
  
  // Format the participant message using our utility function
  const participantMessage = formatGuestParticipantMessage(
    walk, 
    currentUserUid, 
    acceptedParticipants
  );

  return (
    <YStack gap={16}>
      <XStack alignItems="center">
        {/* Only show avatars for participants (excluding organizer) */}
        <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
          {displayAvatars.length > 0 ? (
            <>
              {displayAvatars.map((participant, index) => (
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
