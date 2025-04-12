import { Invitation } from "@/components/InvitationCard";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";
import { db } from "../config/firebase";

// Interface for Firestore Invitation document
export interface InvitationDocument {
  id?: string;
  type: "friend" | "phone";
  name: string;
  recipientUserId?: string;
  recipientPhoneNumber?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Timestamp;
  createdByUid: string;
  walkId?: string; // Optional reference to a walk (for walk invitations)
}

export const saveInvitations = async (
  invitations: Invitation[],
  userId: string,
  walkId?: string
): Promise<string[]> => {
  try {
    const savedIds: string[] = [];

    // Process each invitation
    for (const invitation of invitations) {
      const invitationDoc: InvitationDocument = {
        type: invitation.type,
        name: invitation.name,
        recipientUserId: invitation.recipientUserId,
        recipientPhoneNumber: invitation.recipientPhoneNumber,
        status: "pending",
        createdAt: Timestamp.now(),
        createdByUid: userId,
        walkId,
      };

      // Add the invitation to Firestore
      const docRef = await addDoc(collection(db, "invitations"), invitationDoc);
      savedIds.push(docRef.id);
    }

    return savedIds;
  } catch (error) {
    console.error("Error saving invitations:", error);
    throw error;
  }
};

/**
 * Get all invitations created by the current user
 * @param userId Current user ID
 * @returns Promise with array of invitations
 */
export const getUserInvitations = async (
  userId: string
): Promise<InvitationDocument[]> => {
  try {
    const q = query(
      collection(db, "invitations"),
      where("createdByUid", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as InvitationDocument)
    );
  } catch (error) {
    console.error("Error getting user invitations:", error);
    throw error;
  }
};

/**
 * Delete an invitation
 * @param invitationId ID of the invitation to delete
 * @returns Promise indicating success
 */
export const deleteInvitation = async (invitationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "invitations", invitationId));
  } catch (error) {
    console.error("Error deleting invitation:", error);
    throw error;
  }
};
