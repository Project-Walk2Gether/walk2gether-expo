import WalkChat from "@/components/Chat/WalkChat";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useDoc, useQuery } from "@/utils/firestore";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "tamagui";
import { Message, Walk } from "walk2gether-shared";
import FullScreenLoader from "../FullScreenLoader";
import LiveWalkMap from "./LiveWalkMap";

export default function ActiveWalkScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const insets = useSafeAreaInsets();

  // Get walk messages using the useQuery hook
  const messagesRef = collection(firestore_instance, `walks/${id}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const { docs: messages } = useQuery<Message>(q);

  // Handle sending a message
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !user || !id) return;

    try {
      const messagesRef = collection(
        firestore_instance,
        `walks/${id}/messages`
      );
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
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Map - Using LiveWalkMap component */}
      <View style={styles.mapContainer}>
        <LiveWalkMap walkId={id} />
      </View>

      {/* Walk Chat Section */}
      <View style={styles.chatContainer}>
        <WalkChat
          messages={messages}
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
