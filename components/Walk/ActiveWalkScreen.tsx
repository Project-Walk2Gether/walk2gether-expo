import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useDoc } from "@/utils/firestore";
import WalkChat, { ChatMessage } from "@/components/Chat/WalkChat";
import LiveWalkMap from "./LiveWalkMap";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "tamagui";
import { Walk } from "walk2gether-shared";
import FullScreenLoader from "../FullScreenLoader";

export default function ActiveWalkScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Subscribe to walk messages
  useEffect(() => {
    if (!id) return;

    // Set up messages listener
    const messagesRef = collection(
      firestore_instance,
      `walks/${id}/messages`
    );
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const messagesUnsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          message: data.message,
          createdAt: data.createdAt,
          read: data.read || false,
        };
      });

      setMessages(messagesList);
      setLoadingMessages(false);
    });

    // Clean up the subscription
    return () => {
      if (messagesUnsubscribe) messagesUnsubscribe();
    };
  }, [id]);
  
  // Handle sending a message
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !user || !id) return;
    
    try {
      const messagesRef = collection(firestore_instance, `walks/${id}/messages`);
      addDoc(messagesRef, {
        senderId: user.uid,
        message,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!walk) return <FullScreenLoader />;
  
  if (!id) return <Text>Invalid walk ID</Text>;

  return (
    <View style={styles.container}>
      {/* Map - Using LiveWalkMap component */}
      <View style={styles.mapContainer}>
        <LiveWalkMap walkId={id} />
      </View>

      {/* Walk Chat Section */}
      <View style={styles.chatContainer}>
        <WalkChat
          messages={messages}
          loading={loadingMessages}
          currentUserId={user?.uid || ""}
          onSendMessage={handleSendMessage}
          keyboardVerticalOffset={90}
          containerStyle={styles.walkChatContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    height: "60%",
  },
  chatContainer: {
    height: "40%",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  walkChatContainer: {
    height: "100%",
  },
});
