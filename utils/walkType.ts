import { Walk, WithId } from "walk2gether-shared";

export const getWalkTypeLabel = (type: Walk["type"]) => {
  switch (type) {
    case "friends":
      return "Friend Walk";
    case "neighborhood":
      return "Neighborhood Walk";
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
    return `Your ${walk.type === 'friends' ? 'friend' : 'neighborhood'} walk`;
  } else if (walk.type === 'friends') {
    return `${walk.organizerName} invited you`;
  } else {
    return `${walk.organizerName}'s neighborhood walk`;
  }
};
