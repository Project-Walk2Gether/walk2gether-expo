import { ArrowLeft } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";
import { Friendship } from "walk2gether-shared";
import { FriendshipChat } from "../../../../components/Chat/FriendshipChat";
import { useAuth } from "../../../../context/AuthContext";
import { useDoc } from "../../../../utils/firestore";

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id: string; friendName?: string }>();
  const friendshipId = params.id;
  const { user } = useAuth();
  const router = useRouter();

  // Use useDoc to directly load the friendship document by ID
  const { doc: friendship, status: friendshipStatus } = useDoc<Friendship>(
    `friendships/${friendshipId}`
  );

  const handleBack = () => {
    router.back();
  };

  // Set up the screen header
  // Find the friend's data from the friendship document
  const getFriendData = () => {
    if (!friendship || !user?.uid) return null;
    
    // Find the ID of the user that isn't the current user
    const friendId = friendship.uids.find(uid => uid !== user.uid);
    
    // Get friend data from the denormalized friendship document
    return friendId && friendship.userDataByUid
      ? friendship.userDataByUid[friendId]
      : null;
  };
  
  const friendData = getFriendData();
  const friendName = params.friendName || friendData?.name || "Chat";
  
  const renderHeader = () => {
    return {
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
      headerTitle: () => (
        <Text fontWeight="bold" fontSize="$5">
          {friendName}
        </Text>
      ),
      headerStyle: {
        backgroundColor: "white",
      },
      headerShadowVisible: true,
    };
  };

  return (
    <>
      <Stack.Screen options={renderHeader()} />

      {friendshipStatus === "loading" ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="#4EB1BA" />
          <Text marginTop="$4" color="#666">
            Loading conversation...
          </Text>
        </YStack>
      ) : friendship ? (
        <FriendshipChat friendship={friendship} onBack={handleBack} />
      ) : (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text fontSize="$5" textAlign="center" color="#666">
            Conversation not found
          </Text>
          <Button
            marginTop="$6"
            onPress={handleBack}
            backgroundColor="#4EB1BA"
            color="white"
          >
            Go Back
          </Button>
        </YStack>
      )}
    </>
  );
}
