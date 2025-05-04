import firestore, {
  collection,
  query as fbQuery,
  orderBy,
} from "@react-native-firebase/firestore";
import React from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { Friendship, Message } from "walk2gether-shared";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "../../utils/firestore";
import {
  deleteMessage as deleteMessageUtil,
  sendMessage as sendMessageUtil,
} from "../../utils/messages";
import { UserAvatar } from "../UserAvatar";
import ChatForm from "./ChatForm";
import MessageList from "./MessageList";

interface FriendshipChatProps {
  friendship: Friendship;
}

export function FriendshipChat({ friendship }: FriendshipChatProps) {
  const { user } = useAuth();

  // Find the friend's ID from the friendship uids
  const friendId = friendship.uids.find((uid) => uid !== user?.uid) || "";

  // Get friend data directly from the denormalized friendship document
  const friendData = friendship.userDataByUid?.[friendId];

  // Load messages for this friendship
  const messagesQuery = fbQuery(
    collection(firestore(), `friendships/${friendship.id}/messages`),
    orderBy("createdAt", "asc")
  );

  // Type needs to match MessageList component expectations
  const { docs: messagesData, status: messagesStatus } =
    useQuery<Message>(messagesQuery);

  // Convert Firebase data to ChatMessage type needed by MessageList
  const messages = React.useMemo(() => {
    return messagesData.map((msg) => ({
      ...msg,
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      message: msg.message,
      createdAt: msg.createdAt,
      read: msg.read || false,
    }));
  }, [messagesData]);

  // Function to send a message
  const sendMessage = async (messageText: string) => {
    if (!user || !friendId || !friendship.id) return;

    await sendMessageUtil(friendship.id, user.uid, friendId, messageText);
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
    <YStack f={1}>
      <View flexGrow={1}>
        <MessageList
          messages={messages}
          loading={messagesStatus === "loading"}
          onDeleteMessage={deleteMessage}
          headerTitle={renderHeaderTitle()}
        />
      </View>
      <ChatForm keyboardVerticalOffset={100} onSendMessage={sendMessage} />
    </YStack>
  );
}
