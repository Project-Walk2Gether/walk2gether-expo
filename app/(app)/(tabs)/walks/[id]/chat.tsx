import MessageForm from "@/components/Chat/MessageForm";
import MessageList from "@/components/Chat/MessageList";
import UpcomingRoundsList from "@/components/Chat/UpcomingRoundsList";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalk } from "@/context/WalkContext";
import { useWalkChat } from "@/hooks/useWalkChat";
import { getWalkStatus } from "@/utils/walkUtils";
import React, { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, View, YStack } from "tamagui";
import { MeetupWalk, Round } from "walk2gether-shared";

export default function ChatTab() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { walk } = useWalk();
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const messageListRef = useRef(null);

  // Use our new useWalkChat hook for chat functionality
  const { messages, sendMessage, deleteMessage, isSending } = useWalkChat({
    walkId: walk?.id || "",
    userId: user?.uid || "",
    userName: userData?.name || "Unknown User",
    userPhotoURL: ""
  });

  // Get walk status to determine if owner and active status
  const status = walk ? getWalkStatus(walk) : null;
  const isWalkOwner = walk?.createdByUid === user?.uid;

  // Handle sending message
  const handleSendMessage = ({ message, attachments }: { message?: string, attachments?: any[] }) => {
    if (message) {
      sendMessage({ message, attachments });
    }
  };

  // Handle deleting message
  const handleDelete = async (messageId: string): Promise<void> => {
    return deleteMessage(messageId);
  };

  // Handle message form focus
  const handleMessageFormFocus = () => {
    // Scroll to bottom when keyboard appears
    if (messageListRef.current) {
      setTimeout(() => {
        // Using any to bypass TypeScript error
        (messageListRef.current as any)?.scrollToEnd?.();
      }, 100);
    }
  };

  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Walk not found</Text>
      </View>
    );
  }

  // Combine messages and rounds for the timeline
  const timeline = messages.map(message => ({ type: "message" as const, data: message }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <YStack flex={1} backgroundColor="white">
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <MessageList
            ref={messageListRef}
            timeline={timeline}
            currentUserId={user?.uid || ""}
            loading={false}
            onDeleteMessage={handleDelete}
            onActiveRoundChange={setActiveRound}
            context="walk"
          />
          
          {/* Show upcoming rounds list only for meetup walks and only for the walk owner */}
          {walk && (walk as any).type === "meetup" && isWalkOwner && (
            <UpcomingRoundsList
              walkId={walk.id || ""}
              walk={walk}
              onRoundActivated={(round) => {
                setActiveRound(round);
              }}
            />
          )}
        </ScrollView>

        <MessageForm
          onSendMessage={handleSendMessage}
          keyboardVerticalOffset={90}
          chatId={walk?.id || ""}
          senderId={user?.uid || ""}
          onFocus={handleMessageFormFocus}
          activeRound={activeRound}
          containerStyle={{ backgroundColor: "white" }}
        />
      </YStack>
    </KeyboardAvoidingView>
  );
}
