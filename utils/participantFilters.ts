import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";

/**
 * Filter and categorize participants for a walk
 * This is used across various components that need to display participants in different ways
 */
export function categorizeParticipants(
  participantsById: Record<string, Participant>,
  walk: WithId<Walk>,
  currentUserUid?: string
) {
  // Convert to array and add id property
  const allParticipants = Object.entries(participantsById).map(([id, data]) => {
    const participant = data as Participant;
    return { id, ...participant } as WithId<Participant>;
  });

  // Filter participants into different categories
  const cancelledParticipants = allParticipants.filter(
    (p) => p.cancelledAt && p.userUid !== currentUserUid
  );

  const deniedParticipants = allParticipants.filter(
    (p) => p.deniedAt && !p.cancelledAt && p.userUid !== currentUserUid
  );

  const acceptedParticipants = allParticipants.filter(
    (p) =>
      p.acceptedAt &&
      !p.cancelledAt &&
      !p.deniedAt &&
      p.userUid !== currentUserUid
  );

  const requestedParticipants = allParticipants.filter(
    (p) =>
      p.sourceType === "requested" &&
      !p.acceptedAt &&
      !p.deniedAt &&
      !p.cancelledAt &&
      p.userUid !== currentUserUid
  );

  // Split invited participants based on walk type
  const isFriendsWalk = walkIsFriendsWalk(walk);

  // For friends walks: invited participants
  const invitedParticipants = isFriendsWalk
    ? allParticipants.filter(
        (p) =>
          p.sourceType === "invited" &&
          !p.acceptedAt &&
          !p.deniedAt &&
          !p.cancelledAt &&
          p.userUid !== currentUserUid
      )
    : [];

  // For neighborhood walks: notified participants
  const notifiedParticipants = !isFriendsWalk
    ? allParticipants.filter(
        (p) =>
          p.sourceType === "invited" &&
          !p.acceptedAt &&
          !p.deniedAt &&
          !p.cancelledAt &&
          p.userUid !== currentUserUid
      )
    : [];

  // For the avatar display, calculate avatars to display and overflow
  const maxAvatars = 5;
  const avatarsToDisplay = acceptedParticipants.slice(0, maxAvatars);
  const overflow =
    acceptedParticipants.length > maxAvatars
      ? acceptedParticipants.length - maxAvatars
      : 0;

  return {
    allParticipants,
    acceptedParticipants,
    requestedParticipants,
    invitedParticipants,
    notifiedParticipants,
    deniedParticipants,
    cancelledParticipants,
    avatarsToDisplay,
    overflow,
  };
}

/**
 * Format a list of names into a sentence-case string (e.g., "Alice, Bob and Charlie")
 */
export function formatNamesInSentenceCase(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  // For 3+ names: "Name1, Name2, ... and NameN"
  const lastIndex = names.length - 1;
  const firstPart = names.slice(0, lastIndex).join(", ");
  return `${firstPart} and ${names[lastIndex]}`;
}
