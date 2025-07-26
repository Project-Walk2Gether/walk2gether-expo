import { EmptyMessage } from "@/components/EmptyMessage";
import FAB from "@/components/FAB";
import FriendshipCard from "@/components/FriendshipCard";
import { Screen } from "@/components/UI";
import WalkIcon from "@/components/WalkIcon";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendsContext";
import { getFriendData } from "@/utils/friendshipUtils";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "tamagui";
import { Friendship } from "walk2gether-shared";

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { friendships } = useFriends();

  // Separate friendships into setup and not-setup categories
  const { setupFriendships, notSetupFriendships, settingUpFriendNames } =
    React.useMemo(() => {
      const setup: Friendship[] = [];
      const notSetup: Friendship[] = [];
      const friendNames: string[] = [];

      friendships.forEach((friendship) => {
        // Find the ID of the user that isn't the current user
        const friendId = user?.uid
          ? friendship.uids.find((uid) => uid !== user.uid)
          : null;

        // Check if friend data exists and is not in setup mode
        const friendData =
          friendId &&
          friendship.userDataByUid &&
          friendship.userDataByUid[friendId];
        const isSettingUp = friendData && friendData._isSettingUp;

        if (friendData && !isSettingUp) {
          setup.push(friendship);
        } else {
          notSetup.push(friendship);
          // If we have a name for this person, add it to our list
          if (
            friendData &&
            typeof friendData === "object" &&
            "name" in friendData
          ) {
            friendNames.push(friendData.name);
          }
        }
      });

      return {
        setupFriendships: setup,
        notSetupFriendships: notSetup,
        settingUpFriendNames: friendNames,
      };
    }, [friendships, user?.uid]);

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
        title="Friends"
        gradientVariant="modern"
        useTopInsets
        floatingAction={
          <FAB
            text="Invite a friend"
            onPress={() => router.push("/(app)/(modals)/invite")}
          />
        }
      >
        <View flex={1} px={20}>
          {friendships.length === 0 ? (
            <EmptyMessage
              message="Your friends aren't here yet!"
              subtitle="Add friends to chat and invite on walks"
              icon={WalkIcon}
              iconSize={70}
              iconColor="#7C5F45"
            />
          ) : (
            <>
              {setupFriendships.length === 0 &&
              notSetupFriendships.length > 0 ? (
                <EmptyMessage
                  message="Your friends are setting up"
                  subtitle="Your friends have accepted your invitation but haven't completed their account setup"
                  icon={WalkIcon}
                  iconSize={70}
                  iconColor="#7C5F45"
                />
              ) : (
                // Sort friendships alphabetically by friend name
                [...setupFriendships]
                  .sort((a, b) => {
                    const friendDataA = getFriendData(a, user?.uid);
                    const friendDataB = getFriendData(b, user?.uid);
                    const nameA = friendDataA?.name?.toLowerCase() || "";
                    const nameB = friendDataB?.name?.toLowerCase() || "";
                    return nameA.localeCompare(nameB);
                  })
                  .map((friendship) => (
                    <FriendshipCard
                      key={friendship.id}
                      friendship={friendship}
                      onPress={() => navigateToChat(friendship)}
                    />
                  ))
              )}

              {notSetupFriendships.length > 0 && (
                <View paddingHorizontal="$4" paddingVertical="$3">
                  <Text textAlign="center" color="$gray10">
                    {settingUpFriendNames.length > 0 ? (
                      <>
                        {settingUpFriendNames.length === 1 ? (
                          <>{settingUpFriendNames[0]} has</>
                        ) : settingUpFriendNames.length === 2 ? (
                          <>
                            {settingUpFriendNames[0]} and{" "}
                            {settingUpFriendNames[1]} have
                          </>
                        ) : (
                          <>
                            {settingUpFriendNames.slice(0, -1).join(", ")}, and{" "}
                            {
                              settingUpFriendNames[
                                settingUpFriendNames.length - 1
                              ]
                            }{" "}
                            have
                          </>
                        )}
                        {" accepted your invitation but "}
                        {settingUpFriendNames.length === 1
                          ? "hasn't"
                          : "haven't"}
                        {
                          " completed their account setup in the Walk2Gether app yet."
                        }
                      </>
                    ) : (
                      <>
                        {notSetupFriendships.length}{" "}
                        {notSetupFriendships.length === 1
                          ? "friend has"
                          : "friends have"}{" "}
                        accepted your invitation but{" "}
                        {notSetupFriendships.length === 1
                          ? "hasn't"
                          : "haven't"}{" "}
                        completed their account setup in the Walk2Gether app
                        yet.
                      </>
                    )}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </Screen>
    </>
  );
}
