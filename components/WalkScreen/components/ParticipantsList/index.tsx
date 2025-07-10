import { useMenu } from "@/context/MenuContext";
import { getWalkStatus } from "@/utils/walkUtils";
import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { View } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";
import { useParticipantStatus } from "./hooks/useParticipantStatus";
import ParticipantItem from "./ParticipantItem";
import { sortParticipants } from "./sortParticipants";
import { getStatusMenuItems, StatusType } from "./utils/walkStatusUtils";

interface Props {
  walkStatus: ReturnType<typeof getWalkStatus>;
  participants: ParticipantWithRoute[];
  currentUserId?: string;
  isOwner: boolean;
  walkId: string;
  walkStarted?: boolean;
  onParticipantPress?: (participant: ParticipantWithRoute) => void;
}

export default function ParticipantsList({
  walkId,
  walkStarted,
  walkStatus,
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
  const sortedParticipants = sortParticipants(
    confirmedParticipants,
    currentUserId
  );

  const myParticipant = useMemo(
    () => participants.find((p) => p.userUid === currentUserId),
    [participants]
  );
  const myParticipantStatus = myParticipant?.status;
  const { showMenu } = useMenu();

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

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const {
    updateStatus,
    updateNavigationMethod,
    cancelParticipation,
    reactivateParticipation,
  } = useParticipantStatus({
    walkId,
    userId: currentUserId,
    isOwner,
    walkStarted,
  });

  // Handle status change
  const handleStatusChange = async (newStatus: StatusType) => {
    if (myParticipantStatus === newStatus) return; // Don't update if status is the same

    setIsUpdatingStatus(true);

    await updateStatus(
      newStatus,
      myParticipantStatus,
      myParticipant?.navigationMethod!
    );

    setIsUpdatingStatus(false);
  };

  const handleMeParticipantPress = () => {
    console.log("PRESSING");
    if (!myParticipant) return;

    const status = myParticipant?.status;

    const statusMenuItems = getStatusMenuItems(
      status,
      !!myParticipant.cancelledAt,
      isOwner,
      handleStatusChange,
      cancelParticipation,
      reactivateParticipation
    );
    showMenu("Edit my status", statusMenuItems);
  };

  return (
    <FlatList
      data={dataArray}
      renderItem={({ item }) => (
        <ParticipantItem
          participant={item}
          walkStatus={walkStatus}
          currentUserId={currentUserId}
          onPress={
            item.userUid === currentUserId
              ? handleMeParticipantPress
              : onParticipantPress
          }
        />
      )}
      keyExtractor={(item) => item.id || `participant-${item.userUid}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      ItemSeparatorComponent={() => <View w={6} />}
    />
  );
}
