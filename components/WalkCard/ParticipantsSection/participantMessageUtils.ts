import { Participant, Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";

/**
 * Format an array of names into a sentence case string (e.g., "Mary, Sue and Bob")
 */
export const formatNamesInSentenceCase = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  // For 3+ names: "Name1, Name2, ... and NameN"
  const lastIndex = names.length - 1;
  const firstPart = names.slice(0, lastIndex).join(", ");
  return `${firstPart} and ${names[lastIndex]}`;
};

/**
 * Format a participant message for guests viewing a walk card
 */
export const formatGuestParticipantMessage = (
  walk: WithId<Walk>,
  currentUserUid?: string,
  acceptedParticipants: WithId<Participant>[] = []
): string => {
  const isFriendsWalk = walkIsFriendsWalk(walk);
  const ownerName = walk.organizerName || "the organizer";

  // Get the list of participant names excluding the owner
  const nonOwnerParticipantNames = acceptedParticipants
    .filter((p) => p.userUid !== walk.createdByUid)
    .map((p) => p.displayName || "Someone");

  // Create a combined list that includes the owner's name at the end
  const allParticipantNames = [...nonOwnerParticipantNames];
  if (!allParticipantNames.includes(ownerName)) {
    allParticipantNames.push(ownerName);
  }

  // Check if current user is a participant (accepted but not cancelled)
  const isCurrentUserParticipant =
    currentUserUid &&
    walk.participantsById &&
    walk.participantsById[currentUserUid] &&
    walk.participantsById[currentUserUid].acceptedAt &&
    !walk.participantsById[currentUserUid].cancelledAt;
  
  // For friend walks, if the current user is invited but not yet a participant, 
  // show "[ownerName] invited you"
  if (isFriendsWalk && currentUserUid && 
      walk.participantsById && 
      walk.participantsById[currentUserUid] && 
      !walk.participantsById[currentUserUid].acceptedAt) {
    return `${ownerName} invited you`;
  }

  // Format the message based on number of participants
  if (nonOwnerParticipantNames.length === 0) {
    if (isCurrentUserParticipant) {
      // Only the owner and current user are going
      return `You and ${ownerName} on the walk`;
    } else {
      // Only the owner is going
      return `Be the first to join ${ownerName}`;
    }
  } else {
    // Create participants list based on whether current user is included
    let displayNames = [...allParticipantNames];

    if (isCurrentUserParticipant) {
      // Add "you" to the list if the current user is a participant
      // First filter out the current user's name if it's in the list
      displayNames = displayNames.filter((name) => {
        const participant =
          walk.participantsById && walk.participantsById[currentUserUid];
        return participant && name !== participant.displayName;
      });

      // Add "you" to the beginning
      displayNames.unshift("You");
    }

    // Return formatted message
    return `${formatNamesInSentenceCase(displayNames)} on the walk`;
  }
};
