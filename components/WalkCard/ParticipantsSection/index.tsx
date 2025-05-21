import React, { useMemo } from "react";
import { Participant, Walk, WithId } from "walk2gether-shared";
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

  // Use the count fields from the walk document for efficient rendering
  const approvedCount = walk.approvedParticipantCount || 0;
  const pendingCount = walk.pendingParticipantCount || 0;
  const unapprovedCount = walk.pendingParticipantCount || 0;
  
  // Get participants from the denormalized data
  const participantsById = (walk as any).participantsById || {};
  
  // Process the participant data for display
  const {
    approvedParticipants,
    pendingParticipants,
    avatarsToDisplay,
    overflow
  } = useMemo(() => {
    // Convert to array and add id property
    const allParticipants = Object.entries(participantsById).map(
      ([id, data]) => {
        const participant = data as Participant;
        return { id, ...participant } as WithId<Participant>;
      }
    );
    
    // Separate approved and pending participants
    const approvedParticipants = allParticipants.filter(
      (p) => p.approvedAt && p.userUid !== currentUserUid
    );
    const pendingParticipants = allParticipants.filter(
      (p) => !p.approvedAt && !p.rejectedAt && p.userUid !== currentUserUid
    );

    // For the avatar display, always show approved participants, limited to maxAvatars
    const maxAvatars = 5;
    const avatarsToDisplay = approvedParticipants.slice(0, maxAvatars);
    const overflow = approvedCount > maxAvatars ? approvedCount - maxAvatars : 0;

    return {
      approvedParticipants,
      pendingParticipants,
      avatarsToDisplay,
      overflow,
    };
  }, [participantsById, approvedCount, currentUserUid]);

  // Render the appropriate component based on whether the user is the owner
  return isMine ? (
    <OwnerParticipantsSection 
      walk={walk} 
      currentUserUid={currentUserUid} 
      approvedParticipants={approvedParticipants}
      pendingParticipants={pendingParticipants}
      approvedCount={approvedCount}
      pendingCount={pendingCount}
      unapprovedCount={unapprovedCount}
      avatarsToDisplay={avatarsToDisplay}
      overflow={overflow}
    />
  ) : (
    <GuestParticipantsSection 
      walk={walk} 
      currentUserUid={currentUserUid} 
      approvedParticipants={approvedParticipants}
      pendingParticipants={pendingParticipants}
      approvedCount={approvedCount}
      avatarsToDisplay={avatarsToDisplay}
      overflow={overflow}
    />
  );
};
