import { COLORS } from "@/styles/colors";
import { Walk, WithId } from "walk2gether-shared";

// Define literal types for walk types to satisfy TypeScript constraints
export type WalkTypeKey = "friends" | "neighborhood" | "meetup";

export interface WalkTypeConfig {
  type: WalkTypeKey;
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  description: string;
}

/**
 * Comprehensive walk type configuration with all metadata needed for UI components
 */
export const WALK_TYPES: Record<WalkTypeKey, WalkTypeConfig> = {
  friends: {
    type: "friends",
    title: "Friend",
    icon: "people-outline",
    color: COLORS.walkTypes.friends.main,
    backgroundColor: COLORS.walkTypes.friends.background,
    description: "Schedule a walk with a friend",
  },
  neighborhood: {
    type: "neighborhood",
    title: "Neighborhood",
    icon: "home-outline",
    color: COLORS.walkTypes.neighborhood.main,
    backgroundColor: COLORS.walkTypes.neighborhood.background,
    description: "Start a walk in your neighborhood",
  },
  meetup: {
    type: "meetup",
    title: "Meetup",
    icon: "chatbubbles-outline",
    color: COLORS.walkTypes.meetup.main,
    backgroundColor: COLORS.walkTypes.meetup.background,
    description: "Schedule a walk with a topic, and invite the public",
  },
};

export const getWalkTypeLabel = (type: Walk["type"]) => {
  return type && WALK_TYPES[type] ? WALK_TYPES[type].title : "Walk";
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
  const ownerText = isMine ? "Your" : `${walk.organizerName}'s`;

  if (walk.type === "friends") {
    // Get participants excluding the walk creator and current user
    const participants = Object.values(walk.participantsById || {}).filter(
      (p) =>
        p.userUid !== walk.createdByUid &&
        p.userUid !== currentUserId &&
        !p.cancelledAt &&
        !p.deniedAt
    );

    if (isMine) {
      // Current user is the creator
      if (participants.length === 0) {
        return "Your friend walk";
      } else if (participants.length === 1) {
        return `You invited ${participants[0].displayName}`;
      } else {
        return `You invited ${participants[0].displayName} and ${
          participants.length - 1
        } other${participants.length > 2 ? "s" : ""}`;
      }
    } else {
      // Current user is an invitee
      return `${walk.organizerName} invited you`;
    }
  } else if (walk.type === "meetup") {
    return walk.topic + " meetup";
  } else {
    return `${ownerText} neighborhood walk`;
  }
};
