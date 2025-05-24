import React from "react";
import { Participant, Walk, WithId } from "walk2gether-shared";
import { categorizeParticipants } from "@/utils/participantFilters";
import { ParticipantsSection } from "./ParticipantsSection";
import { WaitingForJoinersSection } from "./WaitingForJoinersSection";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  isMine: boolean;
}

/**
 * A unified component that displays either the ParticipantsSection or 
 * the WaitingForJoinersSection based on whether there are participants
 * other than the owner.
 */
export const ParticipantsDisplay: React.FC<Props> = ({
  walk,
  currentUserUid,
  isMine,
}) => {
  // Create a safe version of participantsById that matches the expected type
  const safeParticipantsById: Record<string, Participant> = {};
  
  // Only proceed if we have participants
  if (walk.participantsById) {
    // Convert to the expected type structure
    Object.entries(walk.participantsById).forEach(([id, participant]) => {
      if (participant) {
        safeParticipantsById[id] = participant as Participant;
      }
    });
  }
  
  // Get accepted participants using the utility function
  const { acceptedParticipants } = categorizeParticipants(
    safeParticipantsById,
    walk,
    currentUserUid
  );
  
  // Filter out the owner from the list of participants
  const hasNonOwnerParticipants = acceptedParticipants.some(
    p => p.userUid !== walk.createdByUid
  );
  
  // Show either the participants section or the waiting section
  return hasNonOwnerParticipants ? (
    <ParticipantsSection walk={walk} currentUserUid={currentUserUid} />
  ) : (
    <WaitingForJoinersSection walk={walk} isMine={isMine} />
  );
};
