import { collection, doc, query, setDoc, Timestamp, where } from "@react-native-firebase/firestore";
import { friendshipSchema } from "walk2gether-shared";
import { firestore_instance } from "../config/firebase";

export interface InviterData {
  id: string;
  name: string;
  profilePicUrl?: string;
}

/**
 * Create a friendship between two users
 * @param currentUserId The current user's ID
 * @param inviterId The inviter's user ID
 * @returns Promise with the friendship ID if successful
 */
export const createFriendship = async (currentUserId: string, inviterId: string): Promise<string> => {
  if (currentUserId === inviterId) {
    throw new Error("You cannot add yourself as a friend");
  }

  // Create a unique ID for the friendship document
  const friendshipId = doc(collection(firestore_instance, "friendships")).id;
  
  // Create the friendship data
  const friendshipData = {
    id: friendshipId,
    uids: [currentUserId, inviterId],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdByUid: currentUserId,
    acceptedAt: Timestamp.now(),
  };
  
  // Validate using the schema
  await friendshipSchema.validate(friendshipData);
  
  // Create the friendship document
  await setDoc(doc(firestore_instance, "friendships", friendshipId), friendshipData);
  
  return friendshipId;
};
