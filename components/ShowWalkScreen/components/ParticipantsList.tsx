import { Avatar, Text, XStack, YStack } from "tamagui";
import React from "react";
import { FlatList } from "react-native";
import { ParticipantWithRoute } from "walk2gether-shared";
import { Footprints, Car, CheckCircle2 } from "@tamagui/lucide-icons";
import { COLORS } from "../../../styles/colors";

interface ParticipantsListProps {
  participants: ParticipantWithRoute[];
  currentUserId?: string;
}

export default function ParticipantsList({
  participants,
  currentUserId,
}: ParticipantsListProps) {
  // Sort participants: current user first, then by status (arrived, on-the-way, pending)
  const sortedParticipants = [...participants].sort((a, b) => {
    // Current user first
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;

    // Then by status: arrived first
    if (a.status === "arrived" && b.status !== "arrived") return -1;
    if (b.status === "arrived" && a.status !== "arrived") return 1;
    
    // Then on-the-way
    if (a.status === "on-the-way" && b.status === "pending") return -1;
    if (b.status === "on-the-way" && a.status === "pending") return 1;

    // Alphabetically by name
    return a.displayName.localeCompare(b.displayName);
  });

  const renderItem = ({ item }: { item: ParticipantWithRoute }) => {
    const isCurrentUser = item.id === currentUserId;
    const isArrived = item.status === "arrived";
    const isOnTheWay = item.status === "on-the-way";
    
    // Determine status display text and color
    let statusText = "Not on the way yet";
    let statusColor = "$gray11";
    
    if (isArrived) {
      statusText = "Arrived!";
      statusColor = "$green9";
    } else if (isOnTheWay) {
      // Show ETA if available
      if (item.route?.duration?.text) {
        statusText = `ETA: ${item.route.duration.text}`;
      } else {
        statusText = "On the way";
      }
      statusColor = COLORS.primary;
    }
    
    return (
      <YStack 
        padding="$2" 
        width={110} 
        margin="$1"
        borderRadius="$4"
        backgroundColor="$gray1"
        borderWidth={1}
        borderColor={isCurrentUser ? COLORS.primary : "$gray4"}
      >
        {/* Row 1: Avatar and name */}
        <XStack alignItems="center" gap="$2" marginBottom="$2">
          <Avatar circular size="$3">
            {item.photoURL ? (
              <Avatar.Image src={item.photoURL} />
            ) : (
              <Avatar.Fallback backgroundColor={COLORS.primary}>
                <Text color="white" fontSize="$2">
                  {item.displayName?.charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            )}
          </Avatar>
          
          <Text 
            fontSize="$2" 
            fontWeight="bold" 
            numberOfLines={1}
            ellipsizeMode="tail"
            flexShrink={1}
          >
            {isCurrentUser ? "You" : item.displayName}
          </Text>
        </XStack>
        
        {/* Row 2: Combined mode icon and status with ETA */}
        <XStack alignItems="center" gap="$1">
          {/* Mode/status icon */}
          {isArrived ? (
            <CheckCircle2 size={14} color="$green9" />
          ) : isOnTheWay ? (
            item.navigationMethod === "driving" ? (
              <Car size={14} color={COLORS.primary} />
            ) : (
              <Footprints size={14} color={COLORS.primary} />
            )
          ) : null}
          
          {/* Status text with ETA */}
          <Text 
            fontSize="$1" 
            color={statusColor} 
            fontWeight="bold"
            flexShrink={1}
            numberOfLines={1}
          >
            {statusText}
          </Text>
        </XStack>
      </YStack>
    );
  };
  
  return (
    <YStack borderTopWidth={1} borderTopColor="$gray4" paddingVertical="$2">
      <FlatList
        data={sortedParticipants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || `participant-${item.userUid}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />
    </YStack>
  );
}
