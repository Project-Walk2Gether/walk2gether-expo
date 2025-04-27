import { Car, CheckCircle2, Footprints, AlertCircle } from "@tamagui/lucide-icons";
import React from "react";
import { FlatList, Pressable } from "react-native";
import { Avatar, Text, XStack, YStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";
import { COLORS } from "../../../styles/colors";

interface ParticipantsListProps {
  participants: ParticipantWithRoute[];
  currentUserId?: string;
  onParticipantPress?: (participant: ParticipantWithRoute) => void;
  isWalkOwner?: boolean;
}

export default function ParticipantsList({
  participants,
  currentUserId,
  onParticipantPress,
  isWalkOwner = false,
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
    const needsApproval = !item.approvedAt && !item.rejectedAt;

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
    } else if (needsApproval) {
      statusText = "Needs approval";
      statusColor = "$orange9";
    }

    const handlePress = () => {
      if (needsApproval && isWalkOwner && onParticipantPress) {
        onParticipantPress(item);
      }
    };

    return (
      <Pressable
        onPress={handlePress}
        disabled={!(needsApproval && isWalkOwner)}
      >
        <YStack
          padding="$2"
          width={110}
          margin="$1"
          borderRadius="$4"
          backgroundColor="$gray1"
          borderWidth={1}
          borderColor={isCurrentUser ? COLORS.primary : needsApproval ? "$orange7" : "$gray4"}
          opacity={item.rejectedAt ? 0.5 : 1}
        >
          {/* Row 1: Avatar and name */}
          <XStack alignItems="center" gap="$2" marginBottom="$2">
            <Avatar circular size="$3">
              {item.photoURL ? (
                <Avatar.Image src={item.photoURL} />
              ) : (
                <Avatar.Fallback
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={COLORS.primary}
                >
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
            ) : needsApproval ? (
              <AlertCircle size={14} color="$orange9" />
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
      </Pressable>
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
