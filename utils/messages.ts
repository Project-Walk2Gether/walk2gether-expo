import firestore, {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "@react-native-firebase/firestore";
import { Attachment, Message } from "walk2gether-shared";

/**
 * Send a message in a friendship conversation
 * @param friendshipId The ID of the friendship document
 * @param senderId The user ID of the message sender
 * @param senderName The display name of the message sender
 * @param recipientId The user ID of the message recipient
 * @param messageData The message content and optional attachments
 * @returns Promise that resolves when the message is sent
 */
export const sendMessage = async (
  friendshipId: string,
  senderId: string,
  senderName: string,
  recipientId: string,
  messageData: { message?: string; attachments?: Attachment[] }
): Promise<void> => {
  // Require either message text or attachments
  const hasText = messageData.message && messageData.message.trim().length > 0;
  const hasAttachments = messageData.attachments && messageData.attachments.length > 0;
  
  if ((!hasText && !hasAttachments) || !senderId || !senderName || !recipientId || !friendshipId) {
    throw new Error("Missing required parameters for sending a message");
  }

  try {
    const db = firestore();

    // Add the message to the friendship's messages collection
    const friendshipPath = `friendships/${friendshipId}/messages`;
    const messagesRef = collection(db, friendshipPath);

    const newMessage: Message = {
      senderId,
      senderName,
      recipientId,
      message: messageData.message || "",
      createdAt: Timestamp.now(),
      read: false,
      attachments: messageData.attachments || [],
    };

    await addDoc(messagesRef, newMessage);

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
