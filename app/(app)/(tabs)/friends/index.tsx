import { collection, query, where } from "@react-native-firebase/firestore";
import { Plus, Users } from "@tamagui/lucide-icons";
import Clouds from "components/Clouds";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View } from "tamagui";
import { useQuery } from "utils/firestore";
import { Friendship } from "walk2gether-shared";
import { EmptyMessage } from "../../../../components/EmptyMessage";
import FAB from "../../../../components/FAB";
import FriendshipCard from "../../../../components/FriendshipCard";
import { BrandGradient, ScreenTitle } from "../../../../components/UI";
import { firestore_instance } from "../../../../config/firebase";
import { useAuth } from "../../../../context/AuthContext";

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const friendshipsQuery = query(
    collection(firestore_instance, "friendships"),
    where("uids", "array-contains", user?.uid)
  );
  const { docs: friendships } = useQuery<Friendship>(friendshipsQuery);

  // Simple time formatter
  const formatMessageTime = (date: Date | null) => {
    if (!date) return "";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      // Today, show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (dayDiff === 1) {
      // Yesterday
      return "Yesterday";
    } else if (dayDiff < 7) {
      // Day of the week
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return days[date.getDay()];
    } else {
      // MM/DD/YYYY
      return date.toLocaleDateString();
    }
  };

  const navigateToChat = (friendId: string) => {
    router.push(`/(app)/(tabs)/friends/${friendId}`);
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
                    onPress={() => navigateToChat(friendship.id)}
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
