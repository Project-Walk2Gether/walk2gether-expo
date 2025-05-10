import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { router } from "expo-router";
import React from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { Friendship } from "walk2gether-shared";
import { UserAvatar } from "./UserAvatar";

interface Props {
  friendship: Friendship & {
    userDataByUid?: Record<
      string,
      {
        name: string;
        profilePicUrl?: string;
      }
    >;
  };
  onPress?: () => void;
}

export const FriendshipCard: React.FC<Props> = ({ friendship, onPress }) => {
  const { user } = useAuth();

  // Find the ID of the user that isn't the current user
  const friendId = user?.uid
    ? friendship.uids.find((uid) => uid !== user.uid)
    : null;

  // Get friend data directly from the denormalized friendship document
  const friendData =
    friendId && friendship.userDataByUid
      ? friendship.userDataByUid[friendId]
      : null;

  // Format the timestamp for display
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp || !timestamp.toDate) return "";

    const date = timestamp.toDate();
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
      return "Yesterday";
    } else if (dayDiff < 7) {
      // Show day of week
      return [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][date.getDay()];
    } else {
      // Show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Handle case where friend data is not found
  if (!friendData) {
    return (
      <Card padding="$4" marginVertical="$2" backgroundColor="$red3">
        <Text color="$red10">Friend data not found</Text>
      </Card>
    );
  }

  const lastMessageTime = friendship.lastMessageAt
    ? formatTimestamp(friendship.lastMessageAt)
    : "";

  // Check if there are unread messages (we'll need to implement this later)
  const unreadCount = 0; // This would come from a separate counter or calculation

  return (
    <Card
      padding="$4"
      marginVertical="$2"
      backgroundColor="white"
      onPress={onPress}
      animation="bouncy"
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      overflow="hidden"
    >
      <XStack alignItems="center" gap="$3">
        {/* Friend's Avatar */}
        <UserAvatar
          uid={friendId || ""}
          size={48}
          backgroundColor={COLORS.primary}
        />

        {/* Friend's Info */}
        <YStack flex={1} justifyContent="center">
          <Text fontWeight="bold" fontSize="$5">
            {friendData.name || "Unknown"}
          </Text>

          {/* Show placeholder if no messages yet */}
          <Text color="$gray10" numberOfLines={1} opacity={0.8}>
            {friendship.lastMessageAt
              ? friendship.lastMessagePreview
              : "No messages yet"}
          </Text>
          
          {/* Display total miles walked together */}
          {friendship.totalMilesWalked ? (
            <Text color="$green9" numberOfLines={1} fontWeight="500">
              Walked 2gether: {friendship.totalMilesWalked.toFixed(1)} miles
            </Text>
          ) : null}
        </YStack>

        {/* Timestamp and unread count */}
        <YStack alignItems="flex-end" justifyContent="center">
          {friendship.lastMessageAt && (
            <Text color="$gray9" fontSize="$2">
              {lastMessageTime}
            </Text>
          )}

          {unreadCount > 0 && (
            <XStack
              width={20}
              height={20}
              borderRadius={10}
              backgroundColor={COLORS.primary}
              alignItems="center"
              justifyContent="center"
              marginTop="$1"
            >
              <Text color="white" fontSize={12}>
                {unreadCount}
              </Text>
            </XStack>
          )}
        </YStack>
      </XStack>
      
      {/* Invite on a walk button */}
      <Button
        mt="$3"
        backgroundColor={COLORS.primary}
        color="white"
        onPress={(e) => {
          e.stopPropagation();
          router.push({
            pathname: "/(app)/(modals)/new-walk",
            params: { friendId: friendId }
          });
        }}
      >
        Invite on a walk
      </Button>
    </Card>
  );
};


export default FriendshipCard;
