import { COLORS } from "@/styles/colors";
import { Users } from "@tamagui/lucide-icons";
import React from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import { Participant, Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  acceptedParticipants: WithId<Participant>[];
  requestedParticipants: WithId<Participant>[];
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

  return (
    <YStack 
      borderTopWidth={1} 
      borderTopColor="$gray4"
      mt={12}
      pt={12}
      gap={16} 
      flex={1}>
      {/* Approved participant avatars */}
      <XStack alignItems="center" gap={8}>
        <XStack alignItems="center" gap={4}>
          <Users size={16} color="#666" />
        </XStack>
        <XStack justifyContent="flex-start" gap={-10} flex={1}>
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
              <Text fontSize={14} color="#666" ml={16} alignSelf="center">
                {acceptedParticipants.length}{" "}
                {acceptedParticipants.length === 1 ? "participant" : "participants"}
              </Text>
            </>
          ) : (
            <Text fontSize={14} color="#666">
              {walkIsFriendsWalk(walk) && requestedParticipants.length > 0
                ? `Requested: ${requestedParticipants
                    .map((p: WithId<Participant>) => p.displayName || "Unknown")
                    .join(", ")}`
                : walkIsFriendsWalk(walk)
                ? "Just the organizer so far"
                : "No neighbors joined yet"}
            </Text>
          )}
        </XStack>
      </XStack>
    </YStack>
  );
};
