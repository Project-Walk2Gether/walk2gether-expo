import React, { useRef } from "react";
import { ScrollView, KeyboardAvoidingView } from "react-native";
import { Text, View, YStack } from "tamagui";
import { useWalk } from "@/context/WalkContext";
import { useAuth } from "@/context/AuthContext";
import { firestore_instance } from "@/config/firebase";
import { useQuery } from "@/utils/firestore";
import { collection, orderBy, query, serverTimestamp, addDoc } from "@react-native-firebase/firestore";
import { Message } from "walk2gether-shared";
import MessageList from "@/components/Chat/MessageList";
import MessageForm from "@/components/Chat/MessageForm";
import { COLORS } from "@/styles/colors";

export default function ChatTab() {
  const { walk } = useWalk();
  const { user } = useAuth();
  const walkId = walk?.id || "";
  
  // Get walk messages using the useQuery hook
  const messagesRef = collection(firestore_instance, `walks/${walkId}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const { docs: messagesData, loading } = useQuery<Message>(q);
  
  // Convert messages to timeline format for MessageList component
  const timeline = React.useMemo(() => {
    // Create timeline items for messages
    const messageItems = messagesData.map((message) => ({
      type: "message" as const,
      data: message,
    }));

    return messageItems;
  }, [messagesData]);

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (!user?.uid || !walkId) return;

    try {
      const messageRef = firestore_instance.doc(
        `walks/${walkId}/messages/${messageId}`
      );
      const messageDoc = await getDoc(messageRef);

      // Only allow users to delete their own messages
      if (messageDoc.exists() && messageDoc.data()?.senderId === user.uid) {
        await messageRef.delete();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async ({
    message,
    attachments,
  }: {
    message?: string;
    attachments?: any[];
  }) => {
    if (!message && (!attachments || attachments.length === 0)) return;
    if (!user || !walkId) return;

    try {
      await addDoc(collection(firestore_instance, `walks/${walkId}/messages`), {
        text: message || "",
        senderId: user.uid,
        senderName: user.displayName || "",
        createdAt: serverTimestamp(),
        // Add attachments if they exist
        ...(attachments && attachments.length > 0
          ? { attachments }
          : {}),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Chat information not available</Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="#fff">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {timeline.length === 0 && !loading ? (
          <View p="$4" alignItems="center" justifyContent="center" height={200}>
            <Text color="$gray11">
              No messages yet. Be the first to chat about this upcoming walk!
            </Text>
          </View>
        ) : (
          <MessageList
            timeline={timeline}
            currentUserId={user?.uid || ""}
            loading={loading}
            onDeleteMessage={handleDeleteMessage}
            context="upcoming-walk"
          />
        )}
      </ScrollView>
      
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={90}
        style={{
          position: "absolute",
          backgroundColor: "white",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <YStack borderTopWidth={1} borderTopColor="$gray4">
          <MessageForm
            onSendMessage={handleSendMessage}
            keyboardVerticalOffset={90}
            containerStyle={{
              backgroundColor: COLORS.chatBackground,
            }}
            chatId={walkId}
            senderId={user?.uid || ""}
          />
        </YStack>
      </KeyboardAvoidingView>
    </View>
  );
}
