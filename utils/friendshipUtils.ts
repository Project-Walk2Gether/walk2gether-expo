import { Friendship } from "walk2gether-shared";

/**
 * Gets the friend's user ID from a friendship object
 * @param friendship The friendship object
 * @param currentUserId The current user's ID
 * @returns The friend's user ID or null if not found
 */
export const getFriendId = (friendship: Friendship, currentUserId?: string | null): string | null => {
  if (!currentUserId) return null;
  return friendship.uids.find(uid => uid !== currentUserId) || null;
};

/**
 * Gets the friend data from a friendship object
 * @param friendship The friendship object
 * @param currentUserId The current user's ID
 * @returns The friend's data or null if not found
 */
export const getFriendData = (friendship: Friendship, currentUserId?: string | null): any | null => {
  const friendId = getFriendId(friendship, currentUserId);
  
  return friendId && friendship.userDataByUid
    ? friendship.userDataByUid[friendId]
    : null;
};
