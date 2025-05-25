import React from "react";
import { Text, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";
import { ParticipantRow } from "./ParticipantRow";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  acceptedParticipants: WithId<Participant>[];
  requestedParticipants: WithId<Participant>[];
  invitedParticipants: WithId<Participant>[];
  notifiedParticipants: WithId<Participant>[];
  deniedParticipants: WithId<Participant>[];
  cancelledParticipants: WithId<Participant>[];
}

/**
 * Participants section shown to the walk owner
 */
export const OwnerParticipantsSection: React.FC<Props> = ({
  walk,
  acceptedParticipants,
  requestedParticipants,
  invitedParticipants,
  notifiedParticipants,
  deniedParticipants,
  cancelledParticipants,
}) => {
  const isFriendsWalk = walkIsFriendsWalk(walk);

  return (
    <YStack mt={"$2"} gap={"$2"}>
      {/* Accepted participants */}
      {acceptedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack flex={1} alignItems="center">
            <ParticipantRow
              participants={acceptedParticipants}
              status="accepted"
              statusText={`${
                acceptedParticipants.length === 1 ? "is" : "are"
              } joining you`}
            />
          </XStack>
        </XStack>
      )}

      {/* No participants yet */}
      {acceptedParticipants.length === 0 &&
        ((isFriendsWalk && invitedParticipants.length === 0) ||
          (!isFriendsWalk && notifiedParticipants.length === 0)) &&
        requestedParticipants.length === 0 && (
          <XStack alignItems="center" gap={8}>
            <Text fontSize={14} color="#222">
              {isFriendsWalk ? "Just you so far" : "No neighbors joined yet"}
            </Text>
          </XStack>
        )}

      {/* Invited friends */}
      {invitedParticipants.length > 0 && (
        <ParticipantRow
          participants={invitedParticipants}
          status="invited"
          statusText="has been invited"
        />
      )}

      {/* Notified neighbors */}
      {notifiedParticipants.length > 0 && (
        <ParticipantRow
          participants={notifiedParticipants}
          status="notified"
          statusText="notified about your walk"
        />
      )}

      {/* Denied participants */}
      {deniedParticipants.length > 0 && (
        <ParticipantRow
          participants={deniedParticipants}
          status="denied"
          statusText="denied from the walk"
        />
      )}

      {/* Cancelled participants */}
      {cancelledParticipants.length > 0 && (
        <ParticipantRow
          participants={cancelledParticipants}
          status="cancelled"
          statusText="can't make it any more"
        />
      )}
    </YStack>
  );
};
