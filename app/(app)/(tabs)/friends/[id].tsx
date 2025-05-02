import firestore, {
  collection,
  orderBy,
  query as fbQuery,
} from "@react-native-firebase/firestore";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Avatar, Button, Text, XStack } from "tamagui";
import { Friendship, Message, UserData } from "walk2gether-shared";
import WalkChat from "../../../../components/Chat/WalkChat";
import { useAuth } from "../../../../context/AuthContext";
import { useDoc, useQuery } from "../../../../utils/firestore";
import { sendMessage as sendMessageUtil } from "../../../../utils/messages";

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const friendshipId = params.id || '';
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Use useDoc to directly load the friendship document by ID
  const { doc: friendship, status: friendshipStatus } = useDoc<Friendship>(
    friendshipId ? `friendships/${friendshipId}` : undefined
  );
  
  // Find the friend's ID from the friendship uids
  const friendId = friendship?.uids?.find(uid => uid !== user?.uid) || '';
  
  // Use useDoc to get the friend's user data
  const { doc: friendData, status: friendStatus } = useDoc<UserData>(
    friendId ? `users/${friendId}` : undefined
  );
  
  // Use useQuery to load messages from the friendship
  const messagesQuery = friendshipId ? fbQuery(
    collection(firestore(), `friendships/${friendshipId}/messages`),
    orderBy('createdAt', 'asc')
  ) : undefined;
  
  // Type needs to match WalkChat component expectations
  const { docs: messagesData, status: messagesStatus } = useQuery<Message>(messagesQuery);
  
  // Convert Firebase data to ChatMessage type needed by WalkChat
  const messages = useMemo(() => {
    return messagesData.map(msg => ({
      ...msg,
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      message: msg.message,
      createdAt: msg.createdAt,
      read: msg.read || false
    })) as (Message & ChatMessage)[];
  }, [messagesData]);

  const handleBack = () => {
    router.back();
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user?.uid || !friendId || !friendshipId) return;

    try {
      await sendMessageUtil(friendshipId, user.uid, friendId, messageText);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <XStack alignItems="center" gap="$2">
              <Avatar circular size="$4">
                {friendData?.profilePicUrl ? (
                  <Avatar.Image src={friendData.profilePicUrl} />
                ) : (
                  <Avatar.Fallback backgroundColor="#8BEBA0">
                    <Text color="white" fontWeight="bold">
                      {friendData?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>
              <Text fontWeight="bold" fontSize="$5">
                {friendData?.name || "Chat"}
              </Text>
            </XStack>
          ),
          headerLeft: () => (
            <Button
              chromeless
              circular
              size="$4"
              onPress={handleBack}
              marginLeft="$1"
              icon={<ArrowLeft size="$1.5" color="#4EB1BA" />}
            />
          ),
          headerStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: true,
        }}
      />

      <WalkChat
        messages={messages}
        loading={friendshipStatus === "loading" || friendStatus === "loading" || messagesStatus === "loading"}
        currentUserId={user?.uid || ""}
        onSendMessage={sendMessage}
        keyboardVerticalOffset={90}
      />
    </>
  );
}
