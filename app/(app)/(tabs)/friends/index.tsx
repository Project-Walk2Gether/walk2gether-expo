import { collection, query, where } from "@react-native-firebase/firestore";
import { Plus, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View } from "tamagui";
import { Friendship } from "walk2gether-shared";
import Clouds from "../../../../components/Clouds";
import { EmptyMessage } from "../../../../components/EmptyMessage";
import FAB from "../../../../components/FAB";
import FriendshipCard from "../../../../components/FriendshipCard";
import { BrandGradient, ScreenTitle } from "../../../../components/UI";
import { firestore_instance } from "../../../../config/firebase";
import { useAuth } from "../../../../context/AuthContext";
import { useQuery } from "../../../../utils/firestore";

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = query(
    collection(firestore_instance, "friendships"),
    where("uids", "array-contains", user?.uid),
    where("deletedAt", "==", null)
  );
  const { docs: friendships } = useQuery<Friendship>(friendshipsQuery);

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
      <BrandGradient style={{ flex: 1 }}>
        <View position="absolute" top={-80} left={0} right={0} bottom={0}>
          <Clouds />
        </View>

        <ScrollView
          flex={1}
          width="100%"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View flex={1} paddingHorizontal={20} paddingTop={insets.top}>
            <ScreenTitle>My Friends</ScreenTitle>
            <View flex={1}>
              {friendships.length === 0 ? (
                <View minHeight={300} py="$10">
                  <EmptyMessage
                    message="No Friends Yet"
                    subtitle="Add friends to chat and invite them to walks!"
                    icon={Users}
                    iconSize={70}
                    iconColor="#333"
                  />
                </View>
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
          </View>
        </ScrollView>
      </BrandGradient>
      {/* Floating Action Button */}
      <FAB
        icon={<Plus size={28} color="white" />}
        accessibilityLabel="Invite a friend"
        onPress={() => router.push("/(app)/(modals)/invite-friends")}
      />
    </>
  );
}
