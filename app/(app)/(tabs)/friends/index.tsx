import Clouds from "@/components/Clouds";
import { EmptyMessage } from "@/components/EmptyMessage";
import FAB from "@/components/FAB";
import FriendshipCard from "@/components/FriendshipCard";
import Sun from "@/components/Sun";
import { Screen } from "@/components/UI";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendsContext";
import { Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "tamagui";
import { Friendship } from "walk2gether-shared";

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { friendships } = useFriends();

  const navigateToChat = (friendship: Friendship) => {
    if (!friendship.id) return;

    // Find the ID of the user that isn't the current user
    const friendId = user?.uid
      ? friendship.uids.find((uid) => uid !== user.uid)
      : null;

    // Get friend data from the denormalized friendship document
    const friendData =
      friendId && friendship.userDataByUid
        ? friendship.userDataByUid[friendId]
        : null;

    // Get the friend's name from denormalized data or use a default
    const friendName = friendData?.name || "Chat";

    // Navigate to the friendship detail screen with the friend's name as a parameter
    router.push({
      pathname: "/friends/[id]",
      params: { id: friendship.id, friendName: friendName },
    });
  };

  return (
    <>
      <StatusBar style="dark" />
      <Screen
        title="My Friends"
        gradientVariant="outdoor"
        useTopInsets
        renderAbsolute={
          <View>
            <Sun
              style={{ position: "absolute", top: 20, right: -10, bottom: 20 }}
            />
            <Clouds
              style={{
                position: "absolute",
                top: -80,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </View>
        }
        floatingAction={
          <FAB
            text="Invite a friend"
            onPress={() => router.push("/(app)/(modals)/invite-friends")}
          />
        }
      >
        <View flex={1}>
          {friendships.length === 0 ? (
            <EmptyMessage
              message="No Friends Yet"
              subtitle="Add friends to chat and invite them to walks!"
              icon={Users}
              iconSize={70}
              iconColor="#333"
            />
          ) : (
            friendships.map((friendship) => (
              <FriendshipCard
                key={friendship.id}
                friendship={friendship}
                onPress={() => navigateToChat(friendship)}
              />
            ))
          )}
        </View>
      </Screen>
    </>
  );
}
