import firestore, {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "@react-native-firebase/firestore";
import { Message } from "walk2gether-shared";

/**
 * Send a message in a friendship conversation
 * @param friendshipId The ID of the friendship document
 * @param senderId The user ID of the message sender
 * @param recipientId The user ID of the message recipient
 * @param messageText The content of the message
 * @returns Promise that resolves when the message is sent
 */
export const sendMessage = async (
  friendshipId: string,
  senderId: string,
  recipientId: string,
  messageText: string
): Promise<void> => {
  if (!messageText.trim() || !senderId || !recipientId || !friendshipId) {
    throw new Error("Missing required parameters for sending a message");
  }

  try {
    const db = firestore();

    // Add the message to the friendship's messages collection
    const friendshipPath = `friendships/${friendshipId}/messages`;
    const messagesRef = collection(db, friendshipPath);

    const messageData: Message = {
      senderId,
      recipientId,
      message: messageText,
      createdAt: Timestamp.now(),
      read: false,
    };

    await addDoc(messagesRef, messageData);

    // Update the lastMessageAt field in the friendship document
    const friendshipRef = doc(db, "friendships", friendshipId);
    friendshipRef.update({
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Delete a message from a friendship conversation
 * @param friendshipId The ID of the friendship document
 * @param messageId The ID of the message to delete
 * @returns Promise that resolves when the message is deleted
 */
export const deleteMessage = async (
  friendshipId: string,
  messageId: string
): Promise<void> => {
  if (!friendshipId || !messageId) {
    throw new Error("Missing required parameters for deleting a message");
  }

  try {
    const db = firestore();
    const messagePath = `friendships/${friendshipId}/messages/${messageId}`;
    const messageRef = doc(db, messagePath);

    await deleteDoc(messageRef);

    // You could update the lastMessageAt field based on the newest remaining message
    // For simplicity, I'm not implementing that here, but it would require a query
    // to find the newest message and update the friendship document
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
