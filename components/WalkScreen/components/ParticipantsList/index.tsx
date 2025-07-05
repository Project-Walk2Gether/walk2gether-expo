import { getWalkStatus } from "@/utils/walkUtils";
import React from "react";
import { FlatList } from "react-native";
import { View } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";
import ParticipantItem from "../ParticipantItem";
import { sortParticipants } from "./sortParticipants";

interface Props {
  status: ReturnType<typeof getWalkStatus>;
  participants: ParticipantWithRoute[];
  currentUserId?: string;
  isOwner: boolean;
  onParticipantPress?: (participant: ParticipantWithRoute) => void;
}

export default function ParticipantsList({
  status,
  participants,
  currentUserId,
  isOwner,
  onParticipantPress,
}: Props) {
  // For ALL users (even owners), we don't directly show invited participants
  // They'll be shown as a special message item
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
  const sortedParticipants = sortParticipants(confirmedParticipants, currentUserId);

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

  // Modified renderItem to handle both regular and invited participants
  const renderListItem = ({
    item,
  }: {
    item: ParticipantWithRoute & { isInvitedParticipant?: boolean };
  }) => {
    return (
      <ParticipantItem
        participant={item}
        walkStatus={status}
        currentUserId={currentUserId}
        onPress={onParticipantPress}
      />
    );
  };

  return (
    <FlatList
      data={dataArray}
      renderItem={({ item }) => renderListItem({ item })}
      keyExtractor={(item) => item.id || `participant-${item.userUid}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      ItemSeparatorComponent={() => <View w={6} />}
    />
  );
}
