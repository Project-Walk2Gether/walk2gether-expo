import { useSheet } from "@/context/SheetContext";
import { getWalkStatus } from "@/utils/walkUtils";
import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { View } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";
import WalkParticipantStatusControls from "../WalkParticipantStatusControls";
import ParticipantItem from "./ParticipantItem";
import { sortParticipants } from "./sortParticipants";

interface Props {
  walkStatus: ReturnType<typeof getWalkStatus>;
  participants: ParticipantWithRoute[];
  currentUserId?: string;
  isOwner: boolean;
  walkId: string;
  onParticipantPress?: (participant: ParticipantWithRoute) => void;
}

export default function ParticipantsList({
  walkId,
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
  const { showSheet, hideSheet } = useSheet();

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

  const handleMeParticipantPress = () => {
    console.log("PRESSING");
    if (!myParticipant) return;

    const status = myParticipant?.status || "pending";

    showSheet(
      <WalkParticipantStatusControls
        status={status}
        isCancelled={!!myParticipant.cancelledAt}
        isOwner={isOwner}
        walkId={walkId}
        userId={currentUserId}
        navigationMethod={myParticipant.navigationMethod || "driving"}
        onClose={hideSheet}
      />,
      { title: "Edit My Status" }
    );
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
