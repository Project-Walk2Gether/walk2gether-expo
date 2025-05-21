import React, { useMemo } from "react";
import { Participant, WithId } from "walk2gether-shared";
import { GuestParticipantsSection } from "./GuestParticipantsSection";
import { OwnerParticipantsSection } from "./OwnerParticipantsSection";
import { ParticipantData, ParticipantsSectionProps } from "./types";
import { useQuery } from "@/utils/firestore";

/**
 * ParticipantsSection component that conditionally renders either the owner or guest view
 * based on whether the current user is the owner of the walk
 */
export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  walk,
  currentUserUid,
}) => {
  const isMine = currentUserUid === walk.createdByUid;

  // Use the count fields from the walk document for efficient rendering
  const approvedCount = walk.approvedParticipantCount || 0;
  const pendingCount = walk.pendingParticipantCount || 0;
  const unapprovedCount = walk.pendingParticipantCount || 0;
  
  // Fetch participants using the custom useQuery hook for now
  // This will be replaced with denormalized data once the schema update is deployed
  const { docs: participants } = useQuery<Participant>(
    walk._ref.collection("participants")
  );
  
  // Prepare participant data
  const participantData = useMemo(() => {
    // Separate approved and pending participants
    const approvedParticipants = participants.filter(
      (p) => p.approvedAt && p.userUid !== currentUserUid
    );
    const pendingParticipants = participants.filter(
      (p) => !p.approvedAt && !p.rejectedAt && p.userUid !== currentUserUid
    );

    // For the avatar display, always show approved participants, limited to maxAvatars
    const maxAvatars = 5;
    const avatarsToDisplay = approvedParticipants.slice(0, maxAvatars);
    const overflow = approvedCount > maxAvatars ? approvedCount - maxAvatars : 0;

    return {
      approvedParticipants,
      pendingParticipants,
      approvedCount,
      pendingCount,
      unapprovedCount,
      avatarsToDisplay,
      overflow,
    };
  }, [participants, approvedCount, pendingCount, unapprovedCount, currentUserUid]);
  
  // Once the schema update is deployed, we can use this code instead:
  /*
  const participantData = useMemo(() => {
    // Get participants from the denormalized data
    const participantsById = (walk as any).participantsById || {};
    
    // Convert to array and add id property
    const allParticipants = Object.entries(participantsById).map(
      ([id, data]) => ({ id, ...data } as WithId<Participant>)
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
      approvedCount,
      pendingCount,
      unapprovedCount,
      avatarsToDisplay,
      overflow,
    };
  }, [(walk as any).participantsById, approvedCount, pendingCount, unapprovedCount, currentUserUid]);
  */

  // Render the appropriate component based on whether the user is the owner
  return isMine ? (
    <OwnerParticipantsSection 
      walk={walk} 
      currentUserUid={currentUserUid} 
      participantData={participantData} 
    />
  ) : (
    <GuestParticipantsSection 
      walk={walk} 
      currentUserUid={currentUserUid} 
      participantData={participantData} 
    />
  );
};
