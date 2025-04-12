import { COLORS } from "@/styles/colors";
import firestore, {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "@react-native-firebase/firestore";
import { ArrowLeft, Send } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView as RNScrollView,
} from "react-native";
import {
  Avatar,
  Button,
  Input,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { useAuth } from "../../../../context/AuthContext";

// Define types for messages and users
type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: Timestamp;
  read?: boolean;
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
  const scrollViewRef = useRef<RNScrollView | null>(null);
  const [messageText, setMessageText] = useState("");
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

        // Scroll to bottom after loading messages
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
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

  const sendMessage = async () => {
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

      setMessageText("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => {
    const isMe = message.senderId === user?.uid;

    return (
      <YStack
        key={message.id}
        alignSelf={isMe ? "flex-end" : "flex-start"}
        backgroundColor={isMe ? "#4EB1BA" : "#eee"}
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderRadius="$4"
        maxWidth="80%"
        marginBottom="$2"
      >
        <Text color={isMe ? "white" : "black"}>{message.message}</Text>
        <Text
          fontSize="$2"
          color={isMe ? "rgba(255,255,255,0.8)" : "#888"}
          alignSelf="flex-end"
        >
          {message.createdAt
            ? formatMessageTime(message.createdAt)
            : "Sending..."}
        </Text>
      </YStack>
    );
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <YStack flex={1} backgroundColor="#F5F5F5">
          {loading ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Spinner size="large" color="#4EB1BA" />
              <Text marginTop="$4" color="#666">
                Loading messages...
              </Text>
            </YStack>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              flex={1}
              padding="$4"
              contentContainerStyle={{ paddingTop: 10 }}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: false })
              }
            >
              {messages.length === 0 ? (
                <YStack
                  height={200}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color="#666" textAlign="center">
                    No messages yet. Say hello!
                  </Text>
                </YStack>
              ) : (
                messages.map(renderMessage)
              )}
            </ScrollView>
          )}

          <XStack
            backgroundColor="white"
            padding="$3"
            alignItems="center"
            gap="$2"
            borderTopWidth={1}
            borderTopColor="#eee"
          >
            <Input
              flex={1}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              backgroundColor="#f0f0f0"
              borderRadius="$4"
              autoCapitalize="none"
              color={COLORS.text}
              paddingHorizontal="$3"
              paddingVertical="$2"
              onSubmitEditing={sendMessage}
            />
            <Button
              size="$4"
              circular
              backgroundColor="#4EB1BA"
              onPress={sendMessage}
              disabled={!messageText.trim()}
              icon={<Send size="$1" color="white" />}
              opacity={!messageText.trim() ? 0.5 : 1}
            />
          </XStack>
        </YStack>
      </KeyboardAvoidingView>
    </>
  );
}
