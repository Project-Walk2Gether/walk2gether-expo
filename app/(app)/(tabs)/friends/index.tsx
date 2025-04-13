import { COLORS } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from "@react-native-firebase/firestore";
import { Search } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  Input,
  ScrollView,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { BrandGradient, ScreenTitle } from "../../../../components/UI";
import { useAuth } from "../../../../context/AuthContext";

// Define Friends type
type Friend = {
  id: string;
  name: string;
  profilePicUrl?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unread?: number;
};

export default function FriendsScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const db = getFirestore();
        const friendsRef = collection(db, `users/${user.uid}/friends`);
        const friendsSnapshot = await getDocs(friendsRef);

        const friendsData = await Promise.all(
          friendsSnapshot.docs.map(async (doc) => {
            // Get the last message if it exists
            let lastMessage = "";
            let lastMessageTime = null;
            let unread = 0;

            try {
              const messagesRef = collection(
                db,
                `users/${user.uid}/friends/${doc.id}/messages`
              );
              const messagesQuery = query(
                messagesRef,
                orderBy("createdAt", "desc"),
                limit(1)
              );
              const messagesSnapshot = await getDocs(messagesQuery);

              if (!messagesSnapshot.empty) {
                const messageData = messagesSnapshot.docs[0].data();
                lastMessage = messageData.message || "";
                lastMessageTime = messageData.createdAt?.toDate();

                // Count unread messages (we'd need a field to track this)
                // This is just a placeholder implementation
                if (messageData.senderId !== user.uid && !messageData.read) {
                  unread++;
                }
              }
            } catch (error) {
              console.error("Error fetching messages:", error);
            }

            return {
              id: doc.id,
              name: doc.data().name || "Unknown Friend",
              profilePicUrl: doc.data().profilePicUrl,
              lastMessage,
              lastMessageTime,
              unread,
              ...doc.data(),
            };
          })
        );

        // Sort by most recent message if available
        const sortedFriends = friendsData.sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        });

        setFriends(sortedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

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
      // This week, show day name
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      // Older, show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Filter friends based on search query
  const filteredFriends = searchQuery
    ? friends.filter((friend) =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  const navigateToChat = (friendId: string) => {
    router.push(`/friends/${friendId}`);
  };

  if (authLoading || loading) {
    return (
      <BrandGradient style={styles.gradientContainer}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </BrandGradient>
    );
  }

  return (
    <>
      <BrandGradient style={styles.gradientContainer}>
        <StatusBar style="light" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenTitle color="black">My Friends</ScreenTitle>

            {friends.length > 0 && (
              <View style={styles.searchContainer}>
                <XStack
                  backgroundColor="white"
                  borderRadius={10}
                  padding="$2"
                  alignItems="center"
                >
                  <Search size="$1" color="#999" marginRight="$2" />
                  <Input
                    flex={1}
                    borderWidth={0}
                    placeholder="Search friends"
                    value={searchQuery}
                    color={COLORS.text}
                    onChangeText={setSearchQuery}
                  />
                </XStack>
              </View>
            )}

            <View style={styles.cardContainer}>
              {filteredFriends.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#666" />
                  <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery
                      ? "No friends match your search."
                      : "You don't have any friends yet. Add friends to start walking with them!"}
                  </Text>
                  {!searchQuery && (
                    <Button
                      backgroundColor={COLORS.action}
                      color={COLORS.textOnDark}
                      marginTop="$4"
                      onPress={() =>
                        router.push("/(app)/(modals)/invite-friends")
                      }
                      icon={
                        <Ionicons name="person-add" size={18} color="white" />
                      }
                      fontWeight="600"
                      size="$4"
                      borderRadius={10}
                    >
                      Invite Friends
                    </Button>
                  )}
                </View>
              ) : (
                filteredFriends.map((friend) => (
                  <XStack
                    key={friend.id}
                    backgroundColor="white"
                    padding="$4"
                    marginBottom="$3"
                    borderRadius={10}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    onPress={() => navigateToChat(friend.id)}
                    style={styles.friendCard}
                  >
                    <Avatar circular size="$6" marginRight="$3">
                      {friend.profilePicUrl ? (
                        <Avatar.Image src={friend.profilePicUrl} />
                      ) : (
                        <Avatar.Fallback
                          backgroundColor={`${COLORS.primary}30`}
                        >
                          <Text color={COLORS.primary} fontWeight="bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </Text>
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                    <YStack flex={1} justifyContent="center">
                      <Text fontWeight="bold" color="#333" fontSize="$5">
                        {friend.name}
                      </Text>
                      {friend.lastMessage ? (
                        <Text color="#666" numberOfLines={1} fontSize="$3">
                          {friend.lastMessage}
                        </Text>
                      ) : null}
                    </YStack>
                    <YStack alignItems="flex-end" justifyContent="center">
                      {friend.lastMessageTime && (
                        <Text fontSize="$2" color="#999" marginBottom="$1">
                          {formatMessageTime(friend.lastMessageTime)}
                        </Text>
                      )}
                      {friend.unread ? (
                        <XStack
                          width={20}
                          height={20}
                          borderRadius={10}
                          backgroundColor={COLORS.primary}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="white" fontSize={12}>
                            {friend.unread}
                          </Text>
                        </XStack>
                      ) : null}
                    </YStack>
                  </XStack>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </BrandGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    marginBottom: 20,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  friendCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
});
