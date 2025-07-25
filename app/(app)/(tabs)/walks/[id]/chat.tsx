import MessageForm from "@/components/Chat/MessageForm";
import MessageList from "@/components/Chat/MessageList";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalk } from "@/context/WalkContext";
import { useWalkChat } from "@/hooks/useWalkChat";
import { useQuery } from "@/utils/firestore";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { sortBy } from "lodash";
import React, { useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, View, YStack } from "tamagui";
import { Round } from "walk2gether-shared";

export default function ChatTab() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { walk } = useWalk();
  const messageListRef = useRef(null);

  const roundsCollection = walk?._ref?.collection(
    "rounds"
  ) as FirebaseFirestoreTypes.CollectionReference<Round>;
  const { docs: rounds } = useQuery(roundsCollection);

  console.log({ walkId: walk?.id, rounds: rounds.map((doc) => doc._ref.path) });
  // Use our new useWalkChat hook for chat functionality
  const { messages, sendMessage, deleteMessage } = useWalkChat({
    walkId: walk?.id || "",
    userId: user?.uid || "",
    userName: userData?.name || "Unknown User",
    userPhotoURL: "",
  });

  // Handle sending message
  const handleSendMessage = ({
    message,
    attachments,
  }: {
    message?: string;
    attachments?: any[];
  }) => {
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

  // Combine messages and rounds for the timeline ,memoizing
  const timelineItems = useMemo(
    () =>
      sortBy(
        [
          ...messages.map((message) => ({
            type: "message" as const,
            data: message,
          })),
          ...rounds.map((round) => ({
            type: "round" as const,
            data: round,
          })),
        ],
        (item) => item.data.createdAt?.toDate()
      ),
    [messages, rounds]
  );

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
            timeline={timelineItems}
            currentUserId={user?.uid || ""}
            loading={false}
            onDeleteMessage={handleDelete}
            context="walk"
          />
        </ScrollView>

        <MessageForm
          onSendMessage={handleSendMessage}
          keyboardVerticalOffset={90}
          chatId={walk?.id || ""}
          senderId={user?.uid || ""}
          onFocus={handleMessageFormFocus}
          containerStyle={{ backgroundColor: "white" }}
        />
      </YStack>
    </KeyboardAvoidingView>
  );
}
