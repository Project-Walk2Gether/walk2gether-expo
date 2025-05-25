import MessageForm from "@/components/Chat/MessageForm";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useDoc, useQuery } from "@/utils/firestore";
import { getWalkTitle } from "@/utils/walkType";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
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
import { Message, ParticipantWithRoute, Walk } from "walk2gether-shared";

export default function WalkScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { userData } = useUserData();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  // Get walk messages using the useQuery hook
  const messagesRef = collection(firestore_instance, `walks/${id}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const { docs: messages } = useQuery<Message>(q);

  // Get all participants for the walk
  const participants = useWalkParticipants(id);

  // References for chat bottom sheet and message list
  const chatBottomSheetRef = useRef<BottomSheet>(null);
  const messageListRef = useRef<MessageListRef>(null);

  // Define snap points for the chat bottom sheet (30% and 100% of screen height)
  // Get collapsed height for calculations (30% of screen height)
  const collapsedHeight = 188;
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
  }: {
    message?: string;
    attachments?: any[];
  }) => {
    // Require either text or attachments
    if (
      ((!message || !message.trim()) &&
        (!attachments || attachments.length === 0)) ||
      !user ||
      !id ||
      !userData
    )
      return;

    try {
      const messagesRef = collection(
        firestore_instance,
        `walks/${id}/messages`
      );
      addDoc(messagesRef, {
        senderId: user.uid,
        senderName: userData.name || user.displayName || "Unknown User",
        message: message || "",
        createdAt: serverTimestamp(),
        read: false,
        attachments: attachments || [],
        walkId: id, // Explicitly set the walkId for the message
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

  // We don't need to render a backdrop for this bottom sheet

  if (!walk) return <FullScreenLoader />;
  if (!id) return <Text>Invalid walk ID</Text>;

  const status = getWalkStatus(walk);

  return (
    <>
      <Stack.Screen
        options={{
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
          <WalkInfo walk={walk} />
          <LiveWalkMap walkId={id} />
          {/* Walk stats will only show when the walk has ended */}
          {/* {walk.endedAt && (
            <View position="absolute" top={10} left={0} right={0} zIndex={10}>
              <WalkStats walk={walk} />
            </View>
          )} */}
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
            contentContainerStyle={{ paddingTop: 28, zIndex: 1000000 }}
          >
            <View position="absolute" top={0} left={0} right={0} h={30}>
              <Text
                textAlign="center"
                fontSize="$5"
                fontWeight="bold"
                mx="$4"
                mb="$2"
                color="#4EB1BA"
              >
                Chat
              </Text>
            </View>
            <ParticipantsList
              status={status}
              participants={participants}
              currentUserId={user?.uid}
              isOwner={isWalkOwner}
              onParticipantPress={handleParticipantPress}
            />
            <MessageList
              ref={messageListRef}
              messages={messages}
              currentUserId={user?.uid || ""}
              loading={false}
            />
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
            />
          </YStack>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
