import React from "react";
import { Text, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";
import { ParticipantRow, formatNamesInSentenceCase } from "./ParticipantRow";

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

  // Debug logs
  console.log("[OwnerParticipantsSection] Debug:", {
    isFriendsWalk,
    acceptedCount: acceptedParticipants.length,
    invitedCount: invitedParticipants.length,
    invitedParticipants: invitedParticipants.map((p) => ({
      displayName: p.displayName,
      sourceType: p.sourceType,
      userUid: p.userUid,
    })),
    walkParticipantsById: walk.participantsById,
  });

  return (
    <YStack borderTopWidth={1} borderTopColor="$gray4" pt={12} gap={"$2"}>
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
            <Text fontSize={14} color="#666">
              {isFriendsWalk ? "Just you so far" : "No neighbors joined yet"}
            </Text>
          </XStack>
        )}

      {/* Waiting for responses - friends walk only */}
      {acceptedParticipants.length === 0 &&
        isFriendsWalk &&
        invitedParticipants.length > 0 && (
          <XStack alignItems="center" gap={8}>
            <Text fontSize={14} color="#666">
              Waiting for a response from{" "}
              {formatNamesInSentenceCase(
                invitedParticipants.map((p) => p.displayName || "Someone")
              )}
            </Text>
          </XStack>
        )}

      {/* Invited friends */}
      {invitedParticipants.length > 0 && (
        <ParticipantRow
          participants={invitedParticipants}
          status="invited"
          statusText="invited to join you"
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
