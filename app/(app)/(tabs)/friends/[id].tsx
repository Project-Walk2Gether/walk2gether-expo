import WalkChat, { ChatMessage } from "@/components/Chat/WalkChat";
import firestore, {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Avatar, Button, Text, XStack } from "tamagui";
import { useAuth } from "../../../../context/AuthContext";

// Define types for the friend data
type Message = ChatMessage & {
  recipientId: string;
};

type Friend = {
  id: string;
  name: string;
  profilePicUrl?: string;
};

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const friendId = params.id;
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch friend data
    const fetchFriend = async () => {
      if (!user || !friendId) return;

      try {
        const db = firestore();
        const friendDocRef = doc(db, `users/${user.uid}/friends/${friendId}`);
        const friendDoc = await getDoc(friendDocRef);

        if (friendDoc.exists) {
          setFriend({
            id: friendDoc.id,
            name: friendDoc.data().name || "Unknown",
            profilePicUrl: friendDoc.data().profilePicUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching friend data:", error);
      }
    };

    fetchFriend();

    // Subscribe to messages
    const subscribeToMessages = () => {
      if (!user || !friendId) return;

      const db = firestore();
      // Create a query to get messages between the current user and the friend
      const messagesRef = collection(
        db,
        `users/${user.uid}/friends/${friendId}/messages`
      );
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      return onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: data.senderId,
            recipientId: data.recipientId,
            message: data.message,
            createdAt: data.createdAt,
            read: data.read || false,
          };
        });

        setMessages(messagesList);
        setLoading(false);

        // Mark received messages as read (would implement in a real app)
        // This would involve updating the message documents in Firestore

        // Messages loaded successfully
      });
    };

    const unsubscribe = subscribeToMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, friendId]);

  const handleBack = () => {
    router.back();
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user || !friendId) return;

    try {
      const db = firestore();
      // Add the message to the current user's message collection
      const messagesRef = collection(
        db,
        `users/${user.uid}/friends/${friendId}/messages`
      );
      await addDoc(messagesRef, {
        senderId: user.uid,
        recipientId: friendId,
        message: messageText,
        createdAt: serverTimestamp(),
        read: false,
      });

      // Also add the message to the friend's message collection (so they can see it)
      // In a production app, this would typically be handled by a Cloud Function
      // to ensure both writes succeed or fail together
      const friendMessagesRef = collection(
        db,
        `users/${friendId}/friends/${user.uid}/messages`
      );
      await addDoc(friendMessagesRef, {
        senderId: user.uid,
        recipientId: friendId,
        message: messageText,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <XStack alignItems="center" gap="$2">
              <Avatar circular size="$4">
                {friend?.profilePicUrl ? (
                  <Avatar.Image src={friend.profilePicUrl} />
                ) : (
                  <Avatar.Fallback backgroundColor="#8BEBA0">
                    <Text color="white" fontWeight="bold">
                      {friend?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>
              <Text fontWeight="bold" fontSize="$5">
                {friend?.name || "Chat"}
              </Text>
            </XStack>
          ),
          headerLeft: () => (
            <Button
              chromeless
              circular
              size="$4"
              onPress={handleBack}
              marginLeft="$1"
              icon={<ArrowLeft size="$1.5" color="#4EB1BA" />}
            />
          ),
          headerStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: true,
        }}
      />

      <WalkChat
        messages={messages}
        loading={loading}
        currentUserId={user?.uid || ""}
        onSendMessage={sendMessage}
        keyboardVerticalOffset={90}
      />
    </>
  );
}
