import { firestore_instance } from "@/config/firebase";
import { useQuery } from "@/utils/firestore";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp
} from "@react-native-firebase/firestore";
import { useCallback, useState } from "react";
import { Message } from "walk2gether-shared";

interface SendMessageParams {
  message?: string;
  attachments?: any[];
}

interface UseWalkChatProps {
  walkId: string;
  userId?: string;
  userName?: string;
  userPhotoURL?: string;
}

export function useWalkChat({ walkId, userId, userName, userPhotoURL }: UseWalkChatProps) {
  const [isSending, setIsSending] = useState(false);
  const queryKey = `walk-${walkId}-messages`;
  
  // Query messages for this walk
  const messagesRef = collection(firestore_instance, `walks/${walkId}/messages`);
  const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));
  
  const { docs: messages, status } = useQuery<Message>(messagesQuery, [queryKey]);
  
  const sendMessage = useCallback(async ({ message, attachments = [] }: SendMessageParams) => {
    if (!userId || !message?.trim() || !walkId) return;
    
    setIsSending(true);
    try {
      // First check if the walk document exists to handle potential race conditions
      const walkRef = firestore_instance.doc(`walks/${walkId}`);
      const walkDoc = await getDoc(walkRef);
      
      if (!walkDoc.exists()) {
        console.error("Walk document doesn't exist");
        return;
      }
      
      await addDoc(collection(firestore_instance, `walks/${walkId}/messages`), {
        // Match the message structure used in the show.tsx file
        senderId: userId,
        senderName: userName || "Unknown User",
        message: message.trim(),
        createdAt: serverTimestamp(),
        read: false,
        attachments: attachments || [],
        walkId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  }, [userId, walkId, userName, userPhotoURL]);
  
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!userId || !walkId) return;
    
    try {
      const messageRef = firestore_instance.doc(`walks/${walkId}/messages/${messageId}`);
      const messageDoc = await getDoc(messageRef);
      
      // Only allow users to delete their own messages
      if (messageDoc.exists() && messageDoc.data()?.senderId === userId) {
        await messageRef.delete();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }, [walkId, userId]);
  
  return {
    messages,
    status,
    isSending,
    sendMessage,
    deleteMessage
  };
}
