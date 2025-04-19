import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";
import { Search } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Card, Input, Spinner, Text, XStack, YStack } from "tamagui";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../styles/colors";

type Friend = {
  id: string;
  name: string;
  [key: string]: any;
};

type Props = {
  onSelectFriend: (friend: Friend) => void;
  title?: string;
  searchEnabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
};

export default function FriendsList({
  onSelectFriend,
  title = "Your Friends",
  searchEnabled = false,
  searchQuery = "",
  onSearchChange,
}: Props) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's friends from Firestore
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const db = getFirestore();
        const friendsRef = collection(db, `users/${user.uid}/friends`);
        const friendsSnapshot = await getDocs(friendsRef);

        const friendsData = friendsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unknown Friend",
          ...doc.data(),
        }));

        setFriends(friendsData);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  // Filter friends if search is enabled and has query
  const filteredFriends = searchQuery
    ? friends.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  if (loading) {
    return (
      <YStack
        gap="$2"
        mt="$2"
        alignItems="center"
        justifyContent="center"
        p="$4"
      >
        <Spinner size="large" color="$blue10" />
        <Text>Loading friends...</Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$2" mt="$2" padding="$2">
      <Text fontSize="$5" fontWeight="bold">
        {title}
      </Text>

      {/* Only show search if enabled and there are friends */}
      {searchEnabled && friends.length > 0 && (
        <XStack alignItems="center" gap="$2" marginVertical="$2">
          <Search color={COLORS.text} size="$1" />
          <Input
            placeholder="Search friends"
            value={searchQuery}
            onChangeText={onSearchChange}
            backgroundColor="white"
            borderRadius={10}
            paddingHorizontal={15}
            fontSize={16}
            flex={1}
            borderWidth={0}
            color={COLORS.text}
          />
        </XStack>
      )}

      {friends.length === 0 ? (
        <Text color="$gray10">
          No friends found. Add friends to invite them.
        </Text>
      ) : (
        filteredFriends.map((friend) => (
          <Card
            bordered
            key={friend.id}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => onSelectFriend(friend)}
          >
            <Card.Header padded>
              <XStack alignItems="center" gap="$2">
                <Ionicons name="person" size={20} color="#4285F4" />
                <Text>{friend.name}</Text>
              </XStack>
            </Card.Header>
          </Card>
        ))
      )}
    </YStack>
  );
}
