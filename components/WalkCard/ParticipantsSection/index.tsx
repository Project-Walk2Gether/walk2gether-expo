import React, { useMemo } from "react";
import { Participant, Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";
import { GuestParticipantsSection } from "./GuestParticipantsSection";
import { OwnerParticipantsSection } from "./OwnerParticipantsSection";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
}

/**
 * ParticipantsSection component that conditionally renders either the owner or guest view
 * based on whether the current user is the owner of the walk
 */
export const ParticipantsSection: React.FC<Props> = ({
  walk,
  currentUserUid,
}) => {
  const isMine = currentUserUid === walk.createdByUid;

  // Get participants from the denormalized data
  const participantsById = (walk as any).participantsById || {};

  // Process the participant data for display
  const {
    acceptedParticipants,
    requestedParticipants,
    invitedParticipants,
    notifiedParticipants,
    deniedParticipants,
    cancelledParticipants,
    avatarsToDisplay,
    overflow,
  } = useMemo(() => {
    // Convert to array and add id property
    const allParticipants = Object.entries(participantsById).map(
      ([id, data]) => {
        const participant = data as Participant;
        return { id, ...participant } as WithId<Participant>;
      }
    );

    // Filter participants into different categories
    const cancelledParticipants = allParticipants.filter(
      (p) => p.cancelledAt && p.userUid !== currentUserUid
    );
    
    const deniedParticipants = allParticipants.filter(
      (p) => p.rejectedAt && !p.cancelledAt && p.userUid !== currentUserUid
    );
    
    const acceptedParticipants = allParticipants.filter(
      (p) => p.acceptedAt && !p.cancelledAt && !p.rejectedAt && p.userUid !== currentUserUid
    );
    
    const requestedParticipants = allParticipants.filter(
      (p) => p.sourceType === "requested" && !p.acceptedAt && !p.rejectedAt && !p.cancelledAt && p.userUid !== currentUserUid
    );
    
    // Split invited participants based on walk type
    const isFriendsWalk = walkIsFriendsWalk(walk);
    
    // For friends walks: invited participants
    const invitedParticipants = isFriendsWalk ? allParticipants.filter(
      (p) => p.sourceType === "invited" && !p.acceptedAt && !p.rejectedAt && !p.cancelledAt && p.userUid !== currentUserUid
    ) : [];
    
    // For neighborhood walks: notified participants
    const notifiedParticipants = !isFriendsWalk ? allParticipants.filter(
      (p) => p.sourceType === "invited" && !p.acceptedAt && !p.rejectedAt && !p.cancelledAt && p.userUid !== currentUserUid
    ) : [];

    // For the avatar display, always show accepted participants, limited to maxAvatars
    const maxAvatars = 5;
    const avatarsToDisplay = acceptedParticipants.slice(0, maxAvatars);
    const overflow = acceptedParticipants.length > maxAvatars ? 
      acceptedParticipants.length - maxAvatars : 0;

    return {
      acceptedParticipants,
      requestedParticipants,
      invitedParticipants,
      notifiedParticipants,
      deniedParticipants,
      cancelledParticipants,
      avatarsToDisplay,
      overflow,
    };
  }, [participantsById, currentUserUid, walk]);

  // Render the appropriate component based on whether the user is the owner
  return isMine ? (
    <OwnerParticipantsSection
      walk={walk}
      currentUserUid={currentUserUid}
      acceptedParticipants={acceptedParticipants}
      requestedParticipants={requestedParticipants}
      invitedParticipants={invitedParticipants}
      notifiedParticipants={notifiedParticipants}
      deniedParticipants={deniedParticipants}
      cancelledParticipants={cancelledParticipants}
      avatarsToDisplay={avatarsToDisplay}
      overflow={overflow}
    />
  ) : (
    <GuestParticipantsSection
      walk={walk}
      currentUserUid={currentUserUid}
      acceptedParticipants={acceptedParticipants}
      requestedParticipants={requestedParticipants}
      invitedParticipants={invitedParticipants}
      notifiedParticipants={notifiedParticipants}
      deniedParticipants={deniedParticipants}
      cancelledParticipants={cancelledParticipants}
      avatarsToDisplay={avatarsToDisplay}
      overflow={overflow}
    />
  );
};
