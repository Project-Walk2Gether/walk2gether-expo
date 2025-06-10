import { FriendshipChat } from "@/components/Chat/FriendshipChat";
import FullScreenLoader from "@/components/FullScreenLoader";
import { NotFoundState } from "@/components/NotFoundState";
import { useMenu } from "@/context/MenuContext";
import { StatefulAvatarWithFullScreen } from "@/components/UserAvatar/StatefulAvatarWithFullScreen";
import { useAuth } from "@/context/AuthContext";
import { useDoc } from "@/utils/firestore";
import { ArrowLeft, UserMinus } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Button, Text, XStack } from "tamagui";
import { Friendship } from "walk2gether-shared";

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id: string; friendName?: string }>();
  const friendshipId = params.id;
  const { user } = useAuth();
  const router = useRouter();
  const { showMenu } = useMenu();

  // Use useDoc to directly load the friendship document by ID
  const { doc: friendship, status } = useDoc<Friendship>(
    `friendships/${friendshipId}`
  );

  const handleBack = () => {
    router.back();
  };

  // Set up the screen header
  // Find the friend's data from the friendship document
  const getFriendData = () => {
    if (!friendship || !user?.uid) return { data: null, id: null };

    // Find the ID of the user that isn't the current user
    const friendId = friendship.uids.find((uid) => uid !== user.uid);

    // Get friend data from the denormalized friendship document
    return {
      data:
        friendId && friendship.userDataByUid
          ? friendship.userDataByUid[friendId]
          : null,
      id: friendId || null,
    };
  };

  const { data: friendData, id: friendId } = getFriendData();
  const friendName = params.friendName || friendData?.name || "Chat";

  // Check if friendship has been deleted, and if so, navigate back
  useEffect(() => {
    if (friendship?.deletedAt) {
      // Friendship has been deleted, navigate back to the friends list
      router.back();
    }
  }, [friendship?.deletedAt, router]);

  // Navigate to unfriend modal
  const handleNavigateToUnfriend = () => {
    if (!friendshipId) return;

    router.push({
      pathname: "/(app)/(modals)/unfriend",
      params: {
        id: friendshipId,
        friendName: friendName,
      },
    });
  };

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
        <XStack alignItems="center" space="$2">
          {/* Display friend's avatar with full screen capability */}
          {friendId && (
            <StatefulAvatarWithFullScreen uid={friendId} size={36} />
          )}
          <Text fontWeight="bold" fontSize="$5">
            {friendName}
          </Text>
        </XStack>
      ),
      headerRight: () => (
        <Button
          size="$2"
          circular
          chromeless
          onPress={() => {
            showMenu("Friendship Options", [
              {
                label: "Something's wrong",
                icon: <UserMinus size="$1" />,
                onPress: handleNavigateToUnfriend,
                theme: "red",
              },
            ]);
          }}
          icon={<UserMinus size="$1" />}
        />
      ),
      headerStyle: {
        backgroundColor: "white",
      },
      headerShadowVisible: true,
    };
  };

  if (status === "loading") return <FullScreenLoader />;

  if (!friendship)
    return (
      <NotFoundState
        title="Conversation not found"
        message="This conversation may have been deleted or is no longer available."
        buttonText="Go Back"
        onButtonPress={handleBack}
      />
    );

  return (
    <>
      <Stack.Screen options={renderHeader()} />
      <FriendshipChat friendship={friendship} />
    </>
  );
}
