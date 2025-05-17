import { Walk, WithId } from "walk2gether-shared";

/**
 * Returns a friendly label for a walk type
 * @param type The type of walk
 * @returns A human-readable label for the walk type
 */
export const getWalkTypeLabel = (type?: string): string => {
  switch (type) {
    case "friends":
      return "Friend walk";
    case "neighborhood":
      return "Neighborhood walk";
    case "meetup":
      return "Meetup walk";
    default:
      return "Walk";
  }
};

/**
 * Generates a formatted title for a walk based on who created it
 * @param walk The walk object
 * @param currentUserId ID of the current user
 * @returns A formatted title for the walk
 */
export const getWalkTitle = (
  walk: WithId<Walk>,
  currentUserId?: string | null
): string => {
  // Check if the walk belongs to the current user
  const isMine = walk.createdByUid === currentUserId;

  if (isMine) {
    return `Your ${getWalkTypeLabel(walk.type)}`;
  } else {
    return `${walk.organizerName}'s ${getWalkTypeLabel(walk.type)}`;
  }
};
