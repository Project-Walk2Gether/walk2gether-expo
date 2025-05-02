import React from "react";
import {
  Avatar,
  Card,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { Friendship, UserData } from "walk2gether-shared";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/colors";

interface FriendshipCardProps {
  friendship: Friendship;
  onPress?: () => void;
}

export const FriendshipCard: React.FC<FriendshipCardProps> = ({
  friendship,
  onPress,
}) => {
  const { user } = useAuth();
  
  // Find the ID of the user that isn't the current user
  const friendId = user?.uid ? friendship.uids.find(uid => uid !== user.uid) : null;
  
  // Get friend data directly from the denormalized friendship document
  const friendData = friendId && friendship.userDataByUid ? 
    friendship.userDataByUid[friendId] : null;
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp || !timestamp.toDate) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dayDiff === 1) {
      return 'Yesterday';
    } else if (dayDiff < 7) {
      // Show day of week
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    } else {
      // Show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

  const lastMessageTime = friendship.lastMessageAt ? formatTimestamp(friendship.lastMessageAt) : '';
  
  // Check if there are unread messages (we'll need to implement this later)
  const unreadCount = 0; // This would come from a separate counter or calculation

  return (
    <Card
      padding="$4"
      marginVertical="$2"
      backgroundColor="white"
      pressable
      onPress={onPress}
      animation="bouncy"
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      overflow="hidden"
    >
      <XStack alignItems="center" gap="$3">
        {/* Friend's Avatar */}
        <Avatar circular size="$6">
          {friendData.profilePicUrl ? (
            <Avatar.Image src={friendData.profilePicUrl} />
          ) : (
            <Avatar.Fallback backgroundColor={COLORS.primary}>
              <Text color="white" fontWeight="bold">
                {friendData.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>
        
        {/* Friend's Info */}
        <YStack flex={1} justifyContent="center">
          <Text fontWeight="bold" fontSize="$5">
            {friendData.name || "Unknown"}
          </Text>
          
          {/* Show placeholder if no messages yet */}
          <Text color="$gray10" numberOfLines={1} opacity={0.8}>
            {friendship.lastMessageAt ? 'Last message...' : "No messages yet"}
          </Text>
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
    </Card>
  );
};

export default FriendshipCard;
