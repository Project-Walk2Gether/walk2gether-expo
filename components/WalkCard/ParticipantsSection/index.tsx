import { categorizeParticipants } from "@/utils/participantFilters";
import React from "react";
import { Walk, WithId } from "walk2gether-shared";
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

  // Process the participant data using our utility function
  const {
    acceptedParticipants,
    requestedParticipants,
    invitedParticipants,
    notifiedParticipants,
    deniedParticipants,
    cancelledParticipants,
  } = categorizeParticipants(participantsById, walk, currentUserUid);

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
    />
  ) : (
    <GuestParticipantsSection
      walk={walk}
      currentUserUid={currentUserUid}
      acceptedParticipants={acceptedParticipants}
    />
  );
};
