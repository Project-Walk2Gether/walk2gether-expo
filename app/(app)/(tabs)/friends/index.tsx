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
import { ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  Card,
  Input,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { BrandGradient, ScreenTitle } from "../../../../components/UI";
import { useAuth } from "../../../../context/AuthContext";
import { COLORS } from "../../../../styles/colors";

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

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <BrandGradient style={{ flex: 1 }}>
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </BrandGradient>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <BrandGradient style={{ flex: 1 }}>
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
            <ScreenTitle color="black">My Friends</ScreenTitle>

            {friends.length > 0 && (
              <View marginBottom={20}>
                <XStack
                  backgroundColor="white"
                  borderRadius={10}
                  padding={12}
                  alignItems="center"
                >
                  <Search size={20} color="#888" />
                  <Input
                    placeholder="Search friends..."
                    borderWidth={0}
                    flex={1}
                    backgroundColor="transparent"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                  />
                </XStack>
              </View>
            )}

            <View flex={1}>
              {filteredFriends.length === 0 ? (
                <View
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  padding={30}
                  minHeight={300}
                >
                  <Ionicons name="people" size={64} color={COLORS.primary} />
                  <Text fontSize={20} fontWeight="bold" color="#333" marginTop={16} marginBottom={8}>
                    No Friends Yet
                  </Text>
                  <Text fontSize={16} color="#666" textAlign="center" marginBottom={16}>
                    Add friends to chat and invite them to walks!
                  </Text>
                  {!searchQuery && (
                    <Button
                      backgroundColor={COLORS.action}
                      color={COLORS.textOnDark}
                      marginTop={16}
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
                  <Card
                    key={friend.id}
                    backgroundColor="white"
                    padding="$4"
                    marginBottom="$3"
                    borderRadius={10}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    onPress={() => navigateToChat(friend.id)}
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                    elevation={2}
                  >
                    <XStack>
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
                  </Card>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </BrandGradient>
    </>
  );
}


