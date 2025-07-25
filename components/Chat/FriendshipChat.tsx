import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { fetchDocsByIds, useQuery } from "@/utils/firestore";
import firestore, {
  collection,
  query as fbQuery,
  orderBy,
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack } from "tamagui";
import { Friendship, Message, Walk, WithId } from "walk2gether-shared";
import {
  deleteMessage as deleteMessageUtil,
  sendMessage as sendMessageUtil,
} from "../../utils/messages";
import FAB from "../FAB";
import { UserAvatar } from "../UserAvatar";
import MessageForm from "./MessageForm";
import MessageList from "./MessageList";
import { TimelineItemType } from "./TimelineItem";

interface FriendshipChatProps {
  friendship: Friendship;
}

export function FriendshipChat({ friendship }: FriendshipChatProps) {
  const { user } = useAuth();
  const { userData } = useUserData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [walks, setWalks] = useState<WithId<Walk>[]>([]);
  const [isLoadingWalks, setIsLoadingWalks] = useState(false);

  // Find the friend's ID from the friendship uids
  const friendId = friendship.uids.find((uid) => uid !== user?.uid) || "";

  // Get friend data directly from the denormalized friendship document
  const friendData = friendship.userDataByUid?.[friendId];

  // Load messages for this friendship
  const messagesQuery = fbQuery(
    collection(firestore(), `friendships/${friendship.id}/messages`),
    orderBy("createdAt", "asc")
  );

  // Load walk references for this friendship
  const walkRefsQuery = fbQuery(
    collection(firestore(), `friendships/${friendship.id}/walkRefs`)
  );

  const handleInviteToWalkButtonPress = () => {
    router.push({
      pathname: "/(app)/(modals)/new-walk",
      params: {
        friendId,
        friendName: friendData?.name || "Chat",
      },
    });
  };

  // Type needs to match MessageList component expectations
  const { docs: messagesData, status: messagesStatus } =
    useQuery<Message>(messagesQuery);

  // Get walk references
  const { docs: walkRefsData, status: walkRefsStatus } = 
    useQuery<{walkId: string}>(walkRefsQuery);

  // Convert Firebase data to ChatMessage type needed by MessageList
  const messages = React.useMemo(() => {
    return messagesData.map((msg) => ({
      ...msg,
      id: msg.id,
      senderId: msg.senderId,
      message: msg.message,
      createdAt: msg.createdAt,
      read: msg.read || false,
    }));
  }, [messagesData]);

  // Effect to fetch walks when walkRefs change
  useEffect(() => {
    if (walkRefsStatus !== "success" || !walkRefsData.length) {
      setWalks([]);
      return;
    }
    
    setIsLoadingWalks(true);
    
    // Extract walk IDs from walkRefs
    const walkIds = walkRefsData.map(ref => ref.walkId).filter(Boolean);
    
    if (!walkIds.length) {
      setWalks([]);
      setIsLoadingWalks(false);
      return;
    }
    
    // Fetch all walk docs by their IDs
    fetchDocsByIds<Walk>("walks", walkIds)
      .then((walkDocs) => {
        setWalks(walkDocs as WithId<Walk>[]);
        setIsLoadingWalks(false);
      })
      .catch((error) => {
        console.error("Error fetching walks:", error);
        setIsLoadingWalks(false);
      });
  }, [walkRefsData, walkRefsStatus]);

  // Merge messages and walks into a single timeline sorted by timestamp
  const timeline = useMemo(() => {
    const messageItems = messages.map(msg => ({
      type: 'message' as const,
      data: msg
    }));
    
    const walkItems = walks.map(walk => ({
      type: 'walk' as const,
      data: walk 
    }));
    
    // Combine and sort by createdAt timestamp
    return [...messageItems, ...walkItems].sort((a, b) => {
      const timeA = a.data.createdAt?.toMillis?.() || 0;
      const timeB = b.data.createdAt?.toMillis?.() || 0;
      return timeA - timeB;
    });
  }, [messages, walks]);

  // Function to send a message with optional attachments
  const sendMessage = async (messageData: {
    message?: string;
    attachments?: any[];
  }) => {
    if (!user || !friendId || !friendship.id || !userData) return;

    // Get the sender's name from userData or fallback to display name or generic name
    const senderName = userData.name || user.displayName || "Unknown User";

    await sendMessageUtil(
      friendship.id,
      user.uid,
      senderName,
      friendId,
      messageData
    );
  };

  // Function to delete a message
  const deleteMessage = async (messageId: string) => {
    if (!friendship.id) return;

    try {
      await deleteMessageUtil(friendship.id, messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      // Here you could add a toast notification or other error handling
    }
  };

  // Render header title component
  const renderHeaderTitle = () => (
    <XStack alignItems="center" gap="$2">
      <UserAvatar uid={friendId} />
      <Text fontWeight="bold" fontSize="$5">
        {friendData?.name || "Chat"}
      </Text>
    </XStack>
  );

  return (
    <View f={1} bg="$background075">
      <View f={1}>
        <MessageList
          timeline={timeline}
          loading={messagesStatus === "loading" || isLoadingWalks}
          onDeleteMessage={deleteMessage}
          headerTitle={renderHeaderTitle()}
          currentUserId={user?.uid || ""}
        />
        <FAB text="Invite to walk" onPress={handleInviteToWalkButtonPress} />
      </View>
      <MessageForm
        keyboardVerticalOffset={100}
        onSendMessage={sendMessage}
        chatId={friendship.id || ""}
        senderId={user?.uid || ""}
      />
    </View>
  );
}
