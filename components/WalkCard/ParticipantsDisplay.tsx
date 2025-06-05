import { COLORS } from "@/styles/colors";
import { categorizeParticipants } from "@/utils/participantFilters";
import { Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";
import { IconTextRow } from "./IconTextRow";
import { OwnerFriendWalkParticipantsSection } from "./ParticipantsSection/OwnerFriendWalkParticipantsSection";
import { OwnerParticipantsSection } from "./ParticipantsSection/OwnerParticipantsSection";
import { WalkCardButton } from "./WalkCardButton";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  isMine: boolean;
  displayAvatars?: Participant[];
  overflow?: number;
}

/**
 * A unified component that displays participants information for a walk.
 * Shows different UI based on whether there are participants and whether the user is the owner.
 */
export const ParticipantsDisplay: React.FC<Props> = ({
  walk,
  currentUserUid,
  isMine,
  displayAvatars: passedDisplayAvatars,
  overflow: passedOverflow,
}) => {
  const router = useRouter();
  const isFriendsWalk = walkIsFriendsWalk(walk);
  const isOwner = currentUserUid === walk.createdByUid;

  // Check if the current user has accepted the invitation
  const currentUserHasAccepted = React.useMemo(() => {
    if (!currentUserUid || isOwner) return true; // Owner or no user ID - not relevant

    // If the user has a participant record with participantsById
    if (walk.participantsById && walk.participantsById[currentUserUid]) {
      const participant = walk.participantsById[currentUserUid] as Participant;
      return (
        participant.acceptedAt !== undefined && participant.acceptedAt !== null
      );
    }

    return false; // No participant record found
  }, [currentUserUid, isOwner, walk.participantsById]);

  // Create a safe version of participantsById that matches the expected type
  const participantsById: Record<string, Participant> = {};

  // Only proceed if we have participants
  if (walk.participantsById) {
    // Convert to the expected type structure
    Object.entries(walk.participantsById).forEach(([id, participant]) => {
      if (participant) {
        participantsById[id] = participant as Participant;
      }
    });
  }

  // Process the participant data using our utility function
  const {
    allParticipants,
    acceptedParticipants,
    requestedParticipants,
    invitedParticipants,
    notifiedParticipants,
  } = categorizeParticipants(participantsById, walk, currentUserUid);

  // Filter out the owner from the list of participants
  const hasNonOwnerParticipants = allParticipants.some(
    (p) => p.userUid !== walk.createdByUid
  );

  // Use passed-in displayAvatars and overflow if provided, otherwise use empty values
  const displayAvatars = passedDisplayAvatars || [];
  const overflow = passedOverflow || 0;

  // Format participants message for guest view
  const formatParticipantMessage = () => {
    const ownerName = walk.organizerName || "the organizer";
    const otherParticipantCount = acceptedParticipants.filter(
      (p) => p.userUid !== walk.createdByUid && p.userUid !== currentUserUid
    ).length;

    const youAreJoining = acceptedParticipants.some(
      (p) => p.userUid === currentUserUid && p.userUid !== walk.createdByUid
    );

    if (youAreJoining) {
      if (otherParticipantCount > 0) {
        return `You and ${otherParticipantCount} other${
          otherParticipantCount !== 1 ? "s" : ""
        } are joining ${ownerName}`;
      }
      return `You are joining ${ownerName}`;
    } else if (otherParticipantCount > 0) {
      return `${otherParticipantCount} ${
        otherParticipantCount === 1 ? "person is" : "people are"
      } joining ${ownerName}`;
    }

    return "";
  };

  // Handler for the invite button
  const handleInvite = () => {
    router.push(`/walks/${walk.id}/invite`);
  };

  // Show owner view
  if (isOwner) {
    // If the owner view has no participants and there's an invite button
    if (!hasNonOwnerParticipants && isFriendsWalk && isMine) {
      return (
        <YStack gap={12}>
          <IconTextRow
            icon={<Users size={16} color="#999" />}
            text={`Waiting for ${
              isFriendsWalk ? "your friend" : "neighbors"
            } to join`}
            right={
              <WalkCardButton
                label="Invite"
                onPress={handleInvite}
                icon={<Users size={14} color="white" />}
                size="$2"
                backgroundColor={COLORS.primary}
                fontWeight="500"
              />
            }
          />
        </YStack>
      );
    }

    // Use the new detailed participant view component for both friends and neighborhood walks
    return (
      <OwnerFriendWalkParticipantsSection
        walk={walk}
        currentUserUid={currentUserUid}
        acceptedParticipants={acceptedParticipants}
        requestedParticipants={requestedParticipants}
        invitedParticipants={invitedParticipants}
        notifiedParticipants={notifiedParticipants}
        deniedParticipants={[]} // We don't have this in our current categorization
        cancelledParticipants={[]} // We don't have this in our current categorization
      />
    );
      
    // Note: We're keeping the legacy OwnerParticipantsSection component for potential future use with other walk types
    // But not using it in the main participant display flow now
  }

  // Show guest view
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
          ) : null}
        </XStack>

        {/* Display participant message */}
        <Text
          fontSize={14}
          color="#666"
          ml={displayAvatars.length > 0 ? 10 : 0}
          flex={1}
        >
          {formatParticipantMessage()}
        </Text>
      </XStack>
    </YStack>
  );
};
