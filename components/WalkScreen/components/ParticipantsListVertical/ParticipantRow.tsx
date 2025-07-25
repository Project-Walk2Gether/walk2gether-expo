import React from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { getWalkStatus } from "@/utils/walkUtils";
import { COLORS } from "@/styles/colors";
import { ParticipantWithRoute } from "walk2gether-shared";
import { MapPin, Car, Calendar, Check } from "@tamagui/lucide-icons";
import { differenceInHours, format } from "date-fns";
import { StatelessAvatar } from "@/components/UserAvatar/StatelessAvatar";

interface Props {
  participant: ParticipantWithRoute & {
    isInvitedParticipant?: boolean;
  };
  walkStatus: ReturnType<typeof getWalkStatus>;
  currentUserId?: string;
  onPress?: (participant: ParticipantWithRoute) => void;
  walkStartTime?: Date;
}

export default function ParticipantRow({
  participant,
  walkStatus,
  currentUserId,
  onPress,
  walkStartTime,
}: Props) {
  const isCurrentUser = participant.userUid === currentUserId;
  const isInvited = participant.isInvitedParticipant;
  
  // Helper function to convert timestamp to Date
  const timestampToDate = (timestamp: any) => {
    if (!timestamp) return undefined;
    
    // Handle Firebase Timestamp objects
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Try to create a date directly
    try {
      return new Date(timestamp);
    } catch (e) {
      console.warn('Unable to convert timestamp to date:', timestamp);
      return undefined;
    }
  };

  // Determine status and get corresponding UI elements
  const getStatusInfo = () => {
    // First check if the participant has cancelled
    if (participant.cancelledAt) {
      return {
        icon: null,
        label: "Can't make it",
        color: "$red10",
        backgroundColor: "$red2",
      };
    } else if (isInvited) {
      return {
        icon: null,
        label: "Invited",
        color: "$gray10",
        backgroundColor: "$gray2",
      };
    } else if (participant.status === "on-the-way") {
      return {
        icon: <Car size={16} color={COLORS.primary} />,
        label: "On the way",
        color: COLORS.primary,
        backgroundColor: "$blue2",
      };
    } else if (participant.status === "arrived") {
      return {
        icon: <MapPin size={16} color="$blue9" />,
        label: "Arrived",
        color: "$blue9",
        backgroundColor: "$blue2",
      };
    } else {
      const now = new Date();
      
      // Check if walk is far in the future (more than 4 hours away)
      const isFutureWalk = walkStartTime && differenceInHours(walkStartTime, now) > 4;
      
      // If it's a future walk and participant has accepted, show when they accepted
      if (isFutureWalk && participant.acceptedAt) {
        const acceptedDate = timestampToDate(participant.acceptedAt);
        return {
          icon: <Check size={16} color="green" />,
          label: acceptedDate ? `Accepted ${format(acceptedDate, "M/d/yy")}` : "Accepted",
          color: "green",
          backgroundColor: "$green2",
        };
      }
      
      // Handle pending status based on whether walk is starting soon
      const isStartingSoon = walkStartTime && differenceInHours(walkStartTime, now) <= 3;
      
      if (walkStatus === "active" || isStartingSoon) {
        return {
          icon: null,
          label: "Not on the way yet",
          color: "$gray10",
          backgroundColor: "$gray2",
        };
      } else {
        return {
          icon: <Calendar size={16} color="$gray10" />,
          label: "Coming",
          color: "$gray10",
          backgroundColor: "$gray2",
        };
      }
    }
  };

  const statusInfo = getStatusInfo();

  // Handle press event
  const handlePress = () => {
    onPress?.(participant);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <XStack
        padding="$3"
        alignItems="center"
        space="$3"
        backgroundColor={isCurrentUser ? "$backgroundHover" : "white"}
      >
        <StatelessAvatar
          profilePicUrl={participant.photoURL || undefined}
          name={participant.displayName}
          size={36}
          backgroundColor="$blue5"
        />

        <YStack flex={1} space="$1">
          <Text
            fontWeight={isCurrentUser ? "bold" : "normal"}
            fontSize="$4"
            color="$gray12"
          >
            {participant.displayName || "Anonymous"}{" "}
            {isCurrentUser && <Text fontSize="$3">(You)</Text>}
          </Text>

          <XStack alignItems="center" space="$1">
            {statusInfo.icon}
            <Text fontSize="$3" color={statusInfo.color}>
              {statusInfo.label}
            </Text>
          </XStack>

          {participant.introduction && (
            <Text fontSize="$2" color="$gray10" numberOfLines={2}>
              "{participant.introduction}"
            </Text>
          )}
        </YStack>

        {/* Display distance info if available */}
        {participant.route?.distance?.text && !isInvited && (
          <YStack alignItems="flex-end" space="$1">
            <Text fontSize="$3" color="$gray11" fontWeight="bold">
              {participant.route.distance.text}
            </Text>
            {participant.route.duration?.text && (
              <Text fontSize="$2" color="$gray9">
                {participant.route.duration.text}
              </Text>
            )}
          </YStack>
        )}
      </XStack>
    </Pressable>
  );
}
