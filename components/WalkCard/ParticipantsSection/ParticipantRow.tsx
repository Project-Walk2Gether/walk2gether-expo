import WalkIcon from "@/components/WalkIcon";
import { COLORS } from "@/styles/colors";
import { Bell, Mail, X } from "@tamagui/lucide-icons";
import React from "react";
import { Avatar, Text, View, XStack } from "tamagui";
import { Participant, WithId } from "walk2gether-shared";

/**
 * Format an array of names into a sentence case string (e.g., "Mary, Sue and Bob")
 */
export const formatNamesInSentenceCase = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  // For 3+ names: "Name1, Name2, ... and NameN"
  const lastIndex = names.length - 1;
  const firstPart = names.slice(0, lastIndex).join(", ");
  return `${firstPart} and ${names[lastIndex]}`;
};

export type ParticipantStatus =
  | "accepted"
  | "invited"
  | "notified"
  | "denied"
  | "cancelled";

interface Props {
  participants: WithId<Participant>[];
  status: ParticipantStatus;
  statusText: string;
}

/**
 * A reusable component for displaying a row of participants with avatars and status
 */
export const ParticipantRow: React.FC<Props> = ({
  participants,
  status,
  statusText,
}) => {
  if (participants.length === 0) return null;

  // Determine icon based on status
  const getStatusIcon = () => {
    switch (status) {
      case "accepted":
        return <WalkIcon size={16} color={COLORS.primary} />;
      case "invited":
        return <Mail size={16} color="$gray10" />;
      case "notified":
        return <Bell size={16} color="$gray10" />;
      case "denied":
      case "cancelled":
        return <X size={16} color="$red10" />;
      default:
        return null;
    }
  };

  return (
    <XStack alignItems="center" gap={8}>
      {/* Status Icon */}
      {getStatusIcon()}

      {/* Avatar stack */}
      <XStack flex={1} alignItems="center">
        <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
          {participants.slice(0, 3).map((participant, index) => (
            <Avatar
              key={participant.id || index}
              size={32}
              circular
              borderColor="white"
              borderWidth={2}
              opacity={status === "invited" || status === "notified" ? 0.7 : 1}
            >
              <Avatar.Image src={participant.photoURL || undefined} />
              <Avatar.Fallback
                justifyContent="center"
                alignItems="center"
                backgroundColor={COLORS.primary}
              >
                <Text color="white">
                  {(participant.displayName || "A").charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            </Avatar>
          ))}
          {participants.length > 3 && (
            <View
              backgroundColor={COLORS.primary}
              width={32}
              height={32}
              borderRadius={16}
              alignItems="center"
              justifyContent="center"
              borderColor="white"
              borderWidth={2}
              opacity={status === "invited" || status === "notified" ? 0.7 : 1}
            >
              <Text fontSize={11} color="white" fontWeight="bold">{`+${
                participants.length - 3
              }`}</Text>
            </View>
          )}
        </XStack>

        {/* Names and status text */}
        <Text fontSize={14} color="#666" ml={10} flex={1}>
          {formatNamesInSentenceCase(
            participants.map((p) => p.displayName || "Someone")
          )}{" "}
          {statusText}
        </Text>
      </XStack>
    </XStack>
  );
};
