import { collection, doc, getDoc, query, setDoc, Timestamp, where } from "@react-native-firebase/firestore";
import { friendshipSchema, UserData } from "walk2gether-shared";
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
  
  // Fetch both users' data to include in the friendship document
  const [currentUserDoc, inviterUserDoc] = await Promise.all([
    getDoc(doc(firestore_instance, "users", currentUserId)),
    getDoc(doc(firestore_instance, "users", inviterId))
  ]);
  
  if (!currentUserDoc.exists || !inviterUserDoc.exists) {
    throw new Error("Could not find one or both users");
  }
  
  const currentUserData = currentUserDoc.data() as UserData;
  const inviterUserData = inviterUserDoc.data() as UserData;
  
  // Create the friendship data with userDataByUid
  const friendshipData = {
    id: friendshipId,
    uids: [currentUserId, inviterId],
    userDataByUid: {
      [currentUserId]: currentUserData,
      [inviterId]: inviterUserData,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdByUid: currentUserId,
    acceptedAt: Timestamp.now(),
    deletedAt: null, // Explicitly set deletedAt to null as required by schema
  };
  
  // Validate using the schema
  await friendshipSchema.validate(friendshipData);
  
  // Create the friendship document
  await setDoc(doc(firestore_instance, "friendships", friendshipId), friendshipData);
  
  return friendshipId;
};
