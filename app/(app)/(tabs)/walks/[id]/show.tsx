import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef } from "react";
import ChatForm from "../../../../../components/Chat/ChatForm";
import WalkChat from "../../../../../components/Chat/WalkChat";
import { firestore_instance } from "../../../../../config/firebase";
import { useAuth } from "../../../../../context/AuthContext";
import { useDoc, useQuery } from "../../../../../utils/firestore";
// Removed StyleSheet import; using Tamagui for styles
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import HeaderBackButton from "components/HeaderBackButton";
import { Dimensions, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "tamagui";
import { Message, ParticipantWithRoute, Walk } from "walk2gether-shared";
import FullScreenLoader from "../../../../../components/FullScreenLoader";
import WalkMenu from "../../../../../components/WalkMenu";
import LiveWalkMap from "../../../../../components/WalkScreen/components/LiveWalkMap";
import ParticipantApprovalDrawer, {
  ParticipantApprovalDrawerRef,
} from "../../../../../components/WalkScreen/components/ParticipantApprovalDrawer";
import ParticipantsList from "../../../../../components/WalkScreen/components/ParticipantsList";
import { useWalkParticipants } from "../../../../../hooks/useWaitingParticipants";
import { COLORS } from "../../../../../styles/colors";

export default function WalkScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const insets = useSafeAreaInsets();
  // Get walk messages using the useQuery hook
  const messagesRef = collection(firestore_instance, `walks/${id}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const { docs: messages } = useQuery<Message>(q);

  const headerHeight = useHeaderHeight();

  // Get all participants for the walk
  const participants = useWalkParticipants(id);

  // References for both drawers
  const approvalDrawerRef = useRef<ParticipantApprovalDrawerRef>(null);
  const chatBottomSheetRef = useRef<BottomSheet>(null);

  // Calculate dimensions for proper layout
  const { height: screenHeight } = Dimensions.get("window");

  // Define snap points for the chat bottom sheet (30% and 100% of screen height)
  // Get collapsed height for calculations (30% of screen height)
  const collapsedHeight = screenHeight * 0.3;
  const chatSnapPoints = useMemo(() => [collapsedHeight, "100%"], []);

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
      const participantRef = doc(
        firestore_instance,
        `walks/${id}/participants/${participantId}`
      );
      await updateDoc(participantRef, {
        approvedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error approving participant:", error);
    }
  };

  // Handle rejecting a participant
  const handleRejectParticipant = async (participantId: string) => {
    try {
      const participantRef = doc(
        firestore_instance,
        `walks/${id}/participants/${participantId}`
      );
      await updateDoc(participantRef, {
        rejectedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error rejecting participant:", error);
    }
  };

  // We don't need to render a backdrop for this bottom sheet

  if (!walk) return <FullScreenLoader />;
  if (!id) return <Text>Invalid walk ID</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Let's walk2gether!",
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => <WalkMenu walk={walk} />,
        }}
      />
      {/* Main container */}
      <View flex={1} backgroundColor="#fff">
        {/* Map and Participants container - with padding to account for collapsed bottom sheet */}
        <View flex={1} pb={collapsedHeight}>
          {/* Map taking most of the available space */}
          <View flex={1}>
            <LiveWalkMap walkId={id} />
          </View>

          {/* Participants List - Positioned above the collapsed bottom sheet */}
          <ParticipantsList
            participants={participants}
            currentUserId={user?.uid}
            onParticipantPress={handleParticipantPress}
            isWalkOwner={isWalkOwner}
          />
        </View>

        {/* Walk Chat in Bottom Sheet - Contains only messages */}
        {true && (
          <BottomSheet
            ref={chatBottomSheetRef}
            index={0}
            snapPoints={chatSnapPoints}
            enablePanDownToClose={false}
            enableOverDrag={false}
            enableContentPanningGesture={true}
            enableHandlePanningGesture={true}
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
            backdropComponent={undefined} // Disable the dark overlay
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
            {/* Chat Title */}
            <View paddingHorizontal="$4" paddingVertical="$2">
              <Text
                fontSize="$5"
                textAlign="center"
                fontWeight="bold"
                color="#4EB1BA"
              >
                Walk Chat
              </Text>
            </View>

            <BottomSheetScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: 70,
                paddingHorizontal: 10,
                minHeight: "100%", // This ensures the grey background fills the entire height
              }}
            >
              <WalkChat
                messages={messages}
                currentUserId={user?.uid || ""}
                loading={false}
                containerStyle={{
                  flex: 1,
                  backgroundColor: COLORS.chatBackground,
                }}
              />
            </BottomSheetScrollView>
          </BottomSheet>
        )}
        <KeyboardAvoidingView
          keyboardVerticalOffset={100}
          behavior="padding"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            backgroundColor: "white",
            right: 0,
            zIndex: 3,
          }}
        >
          <ChatForm
            onSendMessage={handleSendMessage}
            keyboardVerticalOffset={90}
            containerStyle={{
              backgroundColor: COLORS.chatBackground,
            }}
          />
        </KeyboardAvoidingView>

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
