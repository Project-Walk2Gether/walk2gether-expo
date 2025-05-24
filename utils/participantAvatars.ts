import { Participant, Walk, WithId } from "walk2gether-shared";
import { categorizeParticipants } from "./participantFilters";

interface AvatarsResult {
  displayAvatars: Participant[];
  overflow: number;
  hasNonOwnerParticipants: boolean;
}

/**
 * Calculates display avatars and overflow for participants in a walk
 * @param walk The walk object
 * @param currentUserUid The current user's UID
 * @param isMine Whether the current user is the owner of the walk
 * @returns An object containing displayAvatars, overflow, and hasNonOwnerParticipants
 */
export const calculateDisplayAvatars = (
  walk: WithId<Walk>,
  currentUserUid?: string,
  isMine = false
): AvatarsResult => {
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
  const { acceptedParticipants } = categorizeParticipants(
    participantsById,
    walk,
    currentUserUid
  );

  // Filter out the owner from the list of participants
  const hasNonOwnerParticipants = acceptedParticipants.some(
    (p) => p.userUid !== walk.createdByUid
  );

  // For guest view: Calculate avatars to display and overflow
  if (!hasNonOwnerParticipants || isMine) {
    return { displayAvatars: [], overflow: 0, hasNonOwnerParticipants };
  }

  const maxAvatars = 5;

  // Filter out the owner from avatars (since owner's avatar is already shown in card header)
  const nonOwnerParticipants = acceptedParticipants.filter(
    (participant) => participant.userUid !== walk.createdByUid
  );

  return {
    displayAvatars: nonOwnerParticipants.slice(0, maxAvatars),
    overflow: Math.max(0, nonOwnerParticipants.length - maxAvatars),
    hasNonOwnerParticipants,
  };
};
