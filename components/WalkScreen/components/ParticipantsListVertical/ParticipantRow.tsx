import React from "react";
import { Pressable } from "react-native";
import { Avatar, Text, XStack, YStack } from "tamagui";
import { getWalkStatus } from "@/utils/walkUtils";
import { COLORS } from "@/styles/colors";
import { ParticipantWithRoute } from "walk2gether-shared";
import { MapPin, Car, Calendar } from "@tamagui/lucide-icons";
import { differenceInHours } from "date-fns";

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
  
  // Determine status and get corresponding UI elements
  const getStatusInfo = () => {
    if (isInvited) {
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
      // Handle pending status based on whether walk is starting soon
      const now = new Date();
      const isStartingSoon = walkStartTime && 
        differenceInHours(walkStartTime, now) <= 3;
      
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
        <Avatar size="$4" circular>
          {participant.photoURL ? (
            <Avatar.Image
              source={{ uri: participant.photoURL }}
              width="100%"
              height="100%"
            />
          ) : (
            <Avatar.Fallback backgroundColor="$blue5">
              <Text color="white" fontSize="$3">
                {participant.displayName?.[0] || "?"}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>

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
