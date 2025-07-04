import { Router } from "expo-router";
import { Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";

/**
 * Shared handler for navigating to the appropriate screen when a walk card is pressed
 * @param walk The walk to navigate to
 * @param router The expo-router instance
 */
export const handleWalkPress = (walk: WithId<Walk>, router: Router) => {
  if (walkIsFriendsWalk(walk)) {
    // For friends walks, check if participants exist
    const hasParticipants =
      walk.participantUids && walk.participantUids.length > 1; // More than just the creator

    if (hasParticipants) {
      // Friends walk with participants - go to show screen
      router.push({ pathname: `/walks/[id]`, params: { id: walk.id } });
    } else {
      // Friends walk with no participants - go to invite screen
      router.push({
        pathname: `/walks/[id]/invite`,
        params: { id: walk.id },
      });
    }
  } else {
    // Not a friends walk (neighborhood walk) - go to walk details
    router.push({ pathname: `/walks/[id]`, params: { id: walk.id } });
  }
};
