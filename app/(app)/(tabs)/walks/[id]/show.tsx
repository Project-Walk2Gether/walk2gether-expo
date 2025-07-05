import MessageForm from "@/components/Chat/MessageForm";
import UpcomingRoundsList from "@/components/Chat/UpcomingRoundsList";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useDoc, useQuery } from "@/utils/firestore";
import { getWalkTitle } from "@/utils/walkType";
import {
  addDoc,
  collection,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import MessageList, {
  MessageListRef,
} from "../../../../../components/Chat/MessageList";
// Removed StyleSheet import; using Tamagui for styles
import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderBackButton from "@/components/HeaderBackButton";
import WalkInfo from "@/components/WalkInfo";
import WalkMenu from "@/components/WalkMenu";
import LiveWalkMap from "@/components/WalkScreen/components/LiveWalkMap";
import ParticipantsList from "@/components/WalkScreen/components/ParticipantsList";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { COLORS } from "@/styles/colors";
import { getWalkStatus } from "@/utils/walkUtils";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { KeyboardAvoidingView } from "react-native";
import { Text, View, YStack } from "tamagui";
import {
  MeetupWalk,
  Message,
  ParticipantWithRoute,
  Round,
  Walk,
} from "walk2gether-shared";

export default function WalkScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { userData } = useUserData();
  const { doc: walk } = useDoc<Walk | MeetupWalk>(`walks/${id}`);
  // Get walk messages using the useQuery hook
  const messagesRef = collection(firestore_instance, `walks/${id}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const { docs: messagesData } = useQuery<Message>(q);

  // Get rounds for the walk
  const roundsRef = collection(firestore_instance, `walks/${id}/rounds`);
  const roundsQuery = query(roundsRef, orderBy("roundNumber", "asc"));
  const { docs: roundsData } = useQuery<Round>(roundsQuery);

  // Convert messages and rounds to timeline format for MessageList component
  const timeline = React.useMemo(() => {
    // Create timeline items for messages
    const messageItems = messagesData.map((message) => ({
      type: "message" as const,
      data: message,
    }));

    // Create timeline items for rounds
    const roundItems = roundsData.map((round) => ({
      type: "round" as const,
      data: round,
    }));

    // Combine and sort by timestamp (rounds should appear before messages)
    // For simplicity, we'll just put all rounds at the beginning
    return [...roundItems, ...messageItems];
  }, [messagesData, roundsData]);

  // Get all participants for the walk
  const participants = useWalkParticipants(id);

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (!user?.uid || !id) return;

    try {
      const messageRef = firestore_instance.doc(
        `walks/${id}/messages/${messageId}`
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

  // References for chat bottom sheet and message list
  const chatBottomSheetRef = useRef<BottomSheet>(null);
  const messageListRef = useRef<MessageListRef>(null);

  // State for active round
  const [activeRound, setActiveRound] = useState<Round | null>(null);

  // Define snap points for the chat bottom sheet (30% and 100% of screen height)
  // Get collapsed height for calculations (30% of screen height)
  const collapsedHeight = 158;
  const chatSnapPoints = useMemo(() => [collapsedHeight, "100%"], []);

  // Function to handle when message form takes focus
  const handleMessageFormFocus = useCallback(() => {
    // Fully expand the bottom sheet to the maximum height (100%)
    chatBottomSheetRef.current?.expand();

    // Scroll to the bottom of the message list
    if (messageListRef.current) {
      messageListRef.current.scrollToBottom();
    }
  }, []);

  // Check if the current user is the walk owner
  const isWalkOwner = walk?.createdByUid === user?.uid;

  // Handle sending a message with optional attachments
  const handleSendMessage = ({
    message,
    attachments,
    roundId,
    isRoundAnswer,
  }: {
    message?: string;
    attachments?: any[];
    roundId?: string;
    isRoundAnswer?: boolean;
  }) => {
    // Require either text or attachments
    if (
      ((!message || !message.trim()) &&
        (!attachments || attachments.length === 0)) ||
      !user?.uid
    )
      return;

    try {
      addDoc(collection(firestore_instance, `walks/${id}/messages`), {
        senderId: user.uid,
        senderName: userData?.name || "Unknown User",
        message: message?.trim(),
        createdAt: serverTimestamp(),
        read: false,
        attachments: attachments || [],
        walkId: id, // Explicitly set the walkId for the message
        roundId, // Include the round ID if this is a round answer
        isRoundAnswer, // Flag to indicate this is an answer to a round question
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle opening the approval modal
  const handleParticipantPress = (participant: ParticipantWithRoute) => {
    if (!isWalkOwner) return;

    router.push({
      pathname: "/(app)/(modals)/review-participant",
      params: {
        walkId: id,
        participantId: participant.id,
      },
    });
  };

  if (!walk) return <FullScreenLoader />;
  if (!id) return <Text>Invalid walk ID</Text>;

  const status = getWalkStatus(walk);

  console.log({ participants });

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "containedModal",
          title: getWalkTitle(walk, user?.uid),
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <WalkMenu
              walk={walk}
              afterDelete={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
            />
          ),
        }}
      />
      {/* Main container */}
      <View flex={1} backgroundColor="#fff">
        {/* Map and Participants container - with padding to account for collapsed bottom sheet */}
        <View flex={1} pb={collapsedHeight - 30}>
          <LiveWalkMap walkId={id} />
          <View position="absolute" top={"$4"} left={"$4"} right={"$4"}>
            <WalkInfo walk={walk} />
          </View>
        </View>
        <BottomSheet
          ref={chatBottomSheetRef}
          index={0}
          snapPoints={chatSnapPoints}
          handleStyle={{
            backgroundColor: COLORS.chatBackground,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          handleIndicatorStyle={{
            width: 40,
            backgroundColor: "#4EB1BA",
            opacity: 0.6,
          }}
          backgroundStyle={{
            backgroundColor: COLORS.chatBackground,
          }}
          style={{
            backgroundColor: COLORS.chatBackground,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ zIndex: 1000000 }}
          >
            <ParticipantsList
              status={status}
              participants={participants}
              currentUserId={user?.uid}
              isOwner={isWalkOwner}
              onParticipantPress={handleParticipantPress}
            />
            <MessageList
              ref={messageListRef}
              timeline={timeline}
              currentUserId={user?.uid || ""}
              loading={false}
              onDeleteMessage={handleDeleteMessage}
              onActiveRoundChange={setActiveRound}
            />

            {/* Show upcoming rounds list only for meetup walks and only to walk owners */}
            {walk.type === "meetup" && isWalkOwner && (
              <UpcomingRoundsList
                walkId={id}
                upcomingRounds={(walk as MeetupWalk).upcomingRounds || []}
                onRoundActivated={(round) => {
                  // When a round is activated, update the active round state
                  setActiveRound(round);
                }}
                currentUserId={user?.uid}
                isWalkOwner={isWalkOwner}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheet>

        <KeyboardAvoidingView
          keyboardVerticalOffset={100}
          behavior="padding"
          style={{
            position: "absolute",
            backgroundColor: "white",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          <YStack borderTopWidth={1} borderTopColor="$gray4">
            <MessageForm
              onSendMessage={handleSendMessage}
              keyboardVerticalOffset={90}
              containerStyle={{
                backgroundColor: COLORS.chatBackground,
              }}
              chatId={id}
              senderId={user?.uid || ""}
              onFocus={handleMessageFormFocus}
              activeRound={activeRound}
            />
          </YStack>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
