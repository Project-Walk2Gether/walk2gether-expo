import MessageForm from "@/components/Chat/MessageForm";
import MessageList from "@/components/Chat/MessageList";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalk } from "@/context/WalkContext";
import { useWalkChat } from "@/hooks/useWalkChat";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, View, YStack } from "tamagui";

export default function ChatTab() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { walk } = useWalk();
  
  const walkId = walk?.id || "";

  const { 
    messages, 
    status, 
    isSending, 
    sendMessage, 
    deleteMessage 
  } = useWalkChat({ 
    walkId, 
    userId: user?.uid,
    userName: userData?.name || user?.displayName || "Unknown User",
    userPhotoURL: user?.photoURL || ""
  });
  
  // Handle sending message (using our useWalkChat hook)
  const handleSendMessage = ({ message }: { message?: string }) => {
    if (message) {
      sendMessage({ message });
    }
  };

  // Handle deleting message (using our useWalkChat hook)
  const handleDelete = async (messageId: string): Promise<void> => {
    return deleteMessage(messageId);
  };

  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Chat not available</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <YStack flex={1} space="$2">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <MessageList
            timeline={messages.map(message => ({ type: "message", data: message }))}
            currentUserId={user?.uid || ""}
            onDeleteMessage={handleDelete}
            context="walk"
            loading={status === "loading"}
          />

          {messages.length === 0 && status !== "loading" && (
            <View p="$4" alignItems="center">
              <Text color="$gray11">No messages yet</Text>
            </View>
          )}
        </ScrollView>

        <MessageForm
          onSendMessage={handleSendMessage}
          keyboardVerticalOffset={90}
          chatId={walkId}
          senderId={user?.uid || ""}
          containerStyle={{ backgroundColor: "white" }}
        />
      </YStack>
    </KeyboardAvoidingView>
  );
}
