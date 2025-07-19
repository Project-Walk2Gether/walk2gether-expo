import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { getFriendData, getFriendId } from "@/utils/friendshipUtils";
import React, { memo } from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import { Friendship } from "walk2gether-shared";
import { UserAvatar } from "./UserAvatar";
import WalkIcon from "./WalkIcon";

interface Props {
  friendship: Friendship;
  onPress?: () => void;
}

// Helper function to format timestamp, moved outside of any component
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

// Separate component for when the friend is setting up
const SetupPendingCard = memo(() => {
  return (
    <Card
      padding="$4"
      marginVertical="$2"
      backgroundColor="$blue2"
      alignItems="center"
      gap="$2"
    >
      <WalkIcon size={40} color={COLORS.primary} opacity={0.8} />
      <YStack alignItems="center" gap="$1">
        <Text fontWeight="bold" color="$blue10">
          Friend is Setting Up
        </Text>
        <Text color="$blue8" textAlign="center">
          A friend has accepted your invitation but hasn't completed their
          account setup in the Walk2Gether app yet.
        </Text>
      </YStack>
    </Card>
  );
});

// Separate component for when the friend data is available
const FriendDataCard = memo(
  ({
    friendship,
    friendId,
    friendData,
    onPress,
  }: {
    friendship: Friendship;
    friendId: string | null;
    friendData: any;
    onPress?: () => void;
  }) => {
    const lastMessageTime = friendship.lastMessageAt
      ? formatTimestamp(friendship.lastMessageAt)
      : "";

    return (
      <Card
        padding="$2"
        pr="$4"
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
            size={60}
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
          </YStack>
        </XStack>
      </Card>
    );
  }
);

// Main component that chooses which card to render
export const FriendshipCard: React.FC<Props> = memo(
  ({ friendship, onPress }) => {
    const { user } = useAuth();

    // Get friend ID and data using utility functions
    const friendId = getFriendId(friendship, user?.uid);
    const friendData = getFriendData(friendship, user?.uid);

    // Render the appropriate card based on whether friend data exists
    if (!friendData) {
      return <SetupPendingCard />;
    }

    return (
      <FriendDataCard
        friendship={friendship}
        friendId={friendId || null}
        friendData={friendData}
        onPress={onPress}
      />
    );
  }
);

export default FriendshipCard;
