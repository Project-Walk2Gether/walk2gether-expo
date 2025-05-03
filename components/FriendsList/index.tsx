import { Ionicons } from "@expo/vector-icons";
import { collection, query, where } from "@react-native-firebase/firestore";
import React, { useMemo } from "react";
import { Card, Input, Spinner, Text, XStack, YStack } from "tamagui";
import { Friendship } from "walk2gether-shared";
import { firestore_instance } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../styles/colors";
import { useQuery } from "../../utils/firestore";

// Type for simplified friend data derived from friendship document
type Friend = {
  id: string;
  name: string;
  profilePicUrl?: string;
  [key: string]: any;
};

type Props = {
  onSelectFriend: (friend: Friend) => void;
  title?: string;
  searchEnabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  selectedFriendIds?: string[]; // Add prop for tracking selected friends
};

export default function FriendsList({
  onSelectFriend,
  title = "Your Friends",
  searchEnabled = false,
  searchQuery = "",
  onSearchChange,
  selectedFriendIds = [], // Default to empty array
}: Props) {
  const { user } = useAuth();

  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = user?.uid
    ? query(
        collection(firestore_instance, "friendships"),
        where("uids", "array-contains", user.uid),
        where("deletedAt", "==", null)
      )
    : undefined;

  const { docs: friendships, status } = useQuery<Friendship>(friendshipsQuery);
  const loading = status === "loading";

  // Process friendships to extract friend data
  const friends: Friend[] = useMemo(() => {
    if (!friendships || !user) return [];

    return friendships
      .map((friendship) => {
        // Find the other user's ID (not the current user)
        const friendId = friendship.uids.find((uid) => uid !== user.uid);
        if (!friendId || !friendship.userDataByUid?.[friendId]) return null;

        // Get the friend's user data from the friendship document
        const friendData = friendship.userDataByUid[friendId];

        // Extract what we need from friendData, avoiding property duplication
        const {
          name = "Unknown Friend",
          profilePicUrl,
          ...otherData
        } = friendData;

        return {
          id: friendId,
          name,
          profilePicUrl,
          ...otherData, // Include other friend data
        };
      })
      .filter(Boolean) as Friend[];
  }, [friendships, user]);

  // Filter friends if search is enabled and has query
  const filteredFriends = searchQuery
    ? friends.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  if (loading) {
    return (
      <YStack gap="$2" alignItems="center" justifyContent="center" p="$4">
        <Spinner size="large" color="$blue10" />
        <Text>Loading friends...</Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$2">
      {/* Only show search if enabled and there are friends */}
      {searchEnabled && friends.length > 0 && (
        <XStack marginVertical="$2" width="100%">
          {/* Container with relative positioning to properly contain the absolute element */}
          <XStack position="relative" flex={1}>
            <Input
              placeholder="Search friends"
              value={searchQuery}
              onChangeText={onSearchChange}
              backgroundColor="white"
              borderRadius={10}
              paddingLeft={80} // Exact pixel value for search icon + space
              paddingRight={12}
              fontSize={16}
              flex={1}
              size="$5"
              borderWidth={0}
              color={COLORS.text}
            />
          </XStack>
        </XStack>
      )}

      {friends.length === 0 ? (
        <Text color="$gray10">
          No friends found. Add friends to invite them.
        </Text>
      ) : (
        filteredFriends.map((friend) => {
          // Check if this friend is selected
          const isSelected = selectedFriendIds.includes(friend.id);

          return (
            <Card
              key={friend.id}
              pressStyle={{ opacity: 0.8 }}
              // Use backgroundColor to indicate selection state
              backgroundColor={isSelected ? "$blue2" : "white"}
              // Add a border when selected
              borderWidth={isSelected ? 2 : 1}
              borderColor={isSelected ? "$blue8" : "$gray5"}
              onPress={() => onSelectFriend(friend)}
            >
              <Card.Header padded>
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "person"}
                      size={20}
                      color={isSelected ? "#3f78e0" : "#4285F4"}
                    />
                    <Text>{friend.name}</Text>
                  </XStack>
                </XStack>
              </Card.Header>
            </Card>
          );
        })
      )}
    </YStack>
  );
}
