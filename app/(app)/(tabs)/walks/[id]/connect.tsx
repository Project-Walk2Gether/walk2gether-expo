import { stopBackgroundLocationTracking } from "@/background/backgroundLocationTask";
import MessageForm from "@/components/Chat/MessageForm";
import MessageList from "@/components/Chat/MessageList";
import { EndWalkSlider } from "@/components/WalkScreen/components/EndWalkSlider";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalk } from "@/context/WalkContext";
import { useWalkChat } from "@/hooks/useWalkChat";
import { useQuery } from "@/utils/firestore";
import { isOwner } from "@/utils/walkUtils";
import {
  doc,
  FirebaseFirestoreTypes,
  setDoc,
  Timestamp,
} from "@react-native-firebase/firestore";
import { sortBy } from "lodash";
import React, { useMemo, useRef } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
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
          // Add upcoming rounds for walk owners
          ...upcomingRounds.map((upcomingRound, index) => ({
            type: "upcoming-round" as const,
            data: {
              ...upcomingRound,
              // Add a synthetic createdAt for sorting - upcoming rounds should appear at the end
              createdAt: new Date(Date.now() + (index + 1) * 1000), // Stagger them by 1 second each
              isFirstUpcoming: index === 0, // Mark the first one as the next round to start
            },
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

  // Handler for ending a walk (owner only)
  const handleEndWalk = async () => {
    if (!walk || !walk.id) return;

    try {
      await setDoc(
        doc(firestore_instance, "walks", walk.id),
        {
          endedAt: Timestamp.now(),
          status: "completed",
        },
        { merge: true }
      );

      // Stop background tracking for the current user
      stopBackgroundLocationTracking();

      // Show confirmation alert
      Alert.alert(
        "Walk Ended",
        "Your walk has ended. Thank you for using Walk2gether!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error ending walk:", error);
      Alert.alert(
        "Error",
        "There was a problem ending the walk. Please try again."
      );
    }
  };

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
        <MessageList
          ref={messageListRef}
          timeline={timelineItems}
          currentUserId={user?.uid || ""}
          loading={false}
          onDeleteMessage={handleDelete}
          context="walk"
        />

        {/* End walk slider - only shown for walk owners when walk has started but not ended */}
        {walk && isOwner(walk) && walk.startedAt && !walk.endedAt && (
          <EndWalkSlider onEndWalk={handleEndWalk} />
        )}

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
