import MessageForm from "@/components/Chat/MessageForm";
import MessageList from "@/components/Chat/MessageList";
import WalkStatsBar from "@/components/WalkScreen/components/WalkStatsBar";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalk } from "@/context/WalkContext";
import { useWalkChat } from "@/hooks/useWalkChat";
import { useQuery } from "@/utils/firestore";
import { isOwner } from "@/utils/walkUtils";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { sortBy } from "lodash";
import React, { useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Text, View, YStack } from "tamagui";
import {
  MeetupWalk,
  Round,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";

export default function TalkTab() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { walk } = useWalk();
  const messageListRef = useRef(null);
  const roundsCollection = walk?._ref?.collection(
    "rounds"
  ) as FirebaseFirestoreTypes.CollectionReference<Round>;
  const { docs: roundsRaw } = useQuery(roundsCollection);

  // Properly type the rounds
  const rounds = React.useMemo(() => {
    return (roundsRaw || []) as WithId<Round>[];
  }, [roundsRaw]);

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
    console.log("About to send message");
    sendMessage({ message, attachments });
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

  // Get upcoming rounds for walk owners
  const upcomingRounds = useMemo(() => {
    if (!walk || !isOwner(walk) || !walkIsMeetupWalk(walk)) return [];
    const meetupWalk = walk as MeetupWalk;
    return meetupWalk.upcomingRounds || [];
  }, [walk]);

  // Combine messages, rounds, and upcoming rounds for the timeline
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
        (item) => {
          // Handle different timestamp fields for sorting
          const data = item.data as any;
          if (data.createdAt) {
            return data.createdAt.toDate?.() || data.createdAt;
          }
          if (data.startTime) {
            return data.startTime.toDate?.() || data.startTime;
          }
          // For upcoming rounds with synthetic createdAt, return current time + offset
          return new Date();
        }
      ),
    [messages, rounds, upcomingRounds]
  );

  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Walk not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <YStack flex={1} backgroundColor="white">
        {walk.startedAt && <WalkStatsBar walk={walk} />}
        <MessageList
          ref={messageListRef}
          timeline={timelineItems}
          currentUserId={user?.uid || ""}
          loading={false}
          onDeleteMessage={handleDelete}
          context="walk"
        />
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
