import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { firestore_instance } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { useDoc, useQuery } from "../../utils/firestore";
import WalkChat from "../Chat/WalkChat";
// Removed StyleSheet import; using Tamagui for styles
import HeaderCloseButton from "components/HeaderCloseButton";
import WalkMenu from "components/WalkMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H4, Text, View, XStack } from "tamagui";
import { Message, ParticipantWithRoute, Walk } from "walk2gether-shared";
import { useWalkParticipants } from "../../hooks/useWaitingParticipants";
import FullScreenLoader from "../FullScreenLoader";
import LiveWalkMap from "./components/LiveWalkMap";
import ParticipantsList from "./components/ParticipantsList";
import ParticipantApprovalDrawer, { ParticipantApprovalDrawerRef } from "./components/ParticipantApprovalDrawer";

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

  // Get all participants for the walk
  const participants = useWalkParticipants(id);

  // Reference to the bottom drawer
  const approvalDrawerRef = useRef<ParticipantApprovalDrawerRef>(null);

  // Check if the current user is the walk owner
  const isWalkOwner = walk?.createdByUid === user?.uid;

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

  // Handle opening the approval drawer
  const handleParticipantPress = (participant: ParticipantWithRoute) => {
    approvalDrawerRef.current?.openDrawer(participant);
  };

  // Handle approving a participant
  const handleApproveParticipant = async (participantId: string) => {
    try {
      const participantRef = doc(firestore_instance, `walks/${id}/participants/${participantId}`);
      await updateDoc(participantRef, {
        approvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error approving participant:', error);
    }
  };

  // Handle rejecting a participant
  const handleRejectParticipant = async (participantId: string) => {
    try {
      const participantRef = doc(firestore_instance, `walks/${id}/participants/${participantId}`);
      await updateDoc(participantRef, {
        rejectedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error rejecting participant:', error);
    }
  };

  if (!walk) return <FullScreenLoader />;
  if (!id) return <Text>Invalid walk ID</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <H4>Let's walk2gether!</H4>,
          title: "Test",
          headerRight: () => (
            <XStack>
              <WalkMenu walk={walk} />
              <HeaderCloseButton />
            </XStack>
          ),
        }}
      />
      <View flex={1} backgroundColor="#fff" paddingBottom={insets.bottom}>
        {/* Map - Using LiveWalkMap component */}
        <View height="50%">
          <LiveWalkMap walkId={id} />
        </View>

        {/* Participants List - Horizontal FlatList showing participants and their ETAs */}
        <ParticipantsList
          participants={participants}
          currentUserId={user?.uid}
          onParticipantPress={handleParticipantPress}
          isWalkOwner={isWalkOwner}
        />

        {/* Walk Chat Section */}
        <View flex={1} borderTopWidth={1} borderTopColor="#e0e0e0">
          <WalkChat
            messages={messages}
            currentUserId={user?.uid || ""}
            onSendMessage={handleSendMessage}
            keyboardVerticalOffset={90}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Participant Approval Drawer */}
        <ParticipantApprovalDrawer
          ref={approvalDrawerRef}
          onApprove={handleApproveParticipant}
          onReject={handleRejectParticipant}
        />
      </View>
    </>
  );
}
