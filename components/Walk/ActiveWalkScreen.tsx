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
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
// Removed StyleSheet import; using Tamagui for styles
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
  const navigation = useNavigation();
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(false);
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
    <View flex={1} backgroundColor="#fff" paddingBottom={insets.bottom}>
      {/* Map - Using LiveWalkMap component */}
      <View height={isHost ? "55%" : "60%"}>
        <LiveWalkMap walkId={id} />
      </View>

      {/* Walk Chat Section */}
      <View height="40%" borderTopWidth={1} borderTopColor="#e0e0e0">
        <WalkChat
          messages={messages}
          currentUserId={user?.uid || ""}
          onSendMessage={handleSendMessage}
          keyboardVerticalOffset={90}
          containerStyle={{ height: "100%" }}
        />
      </View>
    </View>
  );
}

// All styles have been replaced with Tamagui props above.
