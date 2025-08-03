import { getWalkStatus } from "@/utils/walkUtils";
import React from "react";
import { FlatList } from "react-native";
import { Separator, YStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";
import EmptyState from "../EmptyState";
import ParticipantRow from "./ParticipantRow";
import { sortParticipants } from "./sortParticipants";

interface Props {
  walkStatus: ReturnType<typeof getWalkStatus>;
  participants: ParticipantWithRoute[];
  currentUserId?: string;
  isOwner: boolean;
  walkStartDate?: Date;
  onParticipantPress?: (participant: ParticipantWithRoute) => void;
}

export default function ParticipantsListVertical({
  walkStatus,
  participants,
  currentUserId,
  isOwner,
  walkStartDate,
  onParticipantPress,
}: Props) {
  // Filter to show confirmed or active participants
  const confirmedParticipants = participants.filter(
    (p) =>
      // Include accepted participants or those who are on the way/arrived
      !!p.acceptedAt || p.status === "on-the-way" || p.status === "arrived"
  );

  // Get invited participants (those who haven't accepted/rejected/cancelled yet)
  const invitedParticipants = isOwner
    ? participants.filter(
        (p) =>
          !p.acceptedAt &&
          !p.deniedAt &&
          !p.cancelledAt &&
          p.sourceType === "invited"
      )
    : [];

  // Sort participants based on requirements
  const sortedParticipants = sortParticipants(
    confirmedParticipants,
    currentUserId
  );

  // Define a type that extends ParticipantWithRoute to include our flag
  type ExtendedParticipant = ParticipantWithRoute & {
    isInvitedParticipant?: boolean;
  };

  // Create a combined data array that includes regular participants and invited participants
  const dataArray: ExtendedParticipant[] = [...sortedParticipants];

  // Add invited participants as individual items if the user is the owner
  if (isOwner && invitedParticipants.length > 0) {
    // Add each invited participant to the data array
    invitedParticipants.forEach((participant) => {
      dataArray.push({
        ...participant,
        isInvitedParticipant: true, // Flag to identify this as an invited participant
      } as ExtendedParticipant);
    });
  }

  return (
    <YStack flex={1}>
      {!dataArray.length ? (
        <EmptyState message="No participants in this walk yet." />
      ) : (
        <FlatList
        data={dataArray}
        renderItem={({ item }) => (
          <ParticipantRow
            participant={item}
            walkStatus={walkStatus}
            currentUserId={currentUserId}
            walkStartTime={walkStartDate}
            onPress={onParticipantPress}
          />
        )}
        keyExtractor={(item) => item.id || `participant-${item.userUid}`}
        ItemSeparatorComponent={() => <Separator />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
      )}
    </YStack>
  );
}
