import { Calendar, CalendarClock, CheckCircle, Clock } from "@tamagui/lucide-icons";
import React from "react";
import { XStack, Text, YStack } from "tamagui";
import { getSmartDateFormat } from "@/utils/dateUtils";

interface Props {
  type: "scheduled" | "countdown" | "active" | "completed";
  walkDate?: Date;
  timeUntilWalk?: number;
  elapsedSeconds?: number;
  durationSeconds?: number;
  formatTime: (seconds: number) => string;
}

export function TimeRow({
  type,
  walkDate,
  timeUntilWalk,
  elapsedSeconds,
  durationSeconds,
  formatTime,
}: Props) {
  // Render different content based on type
  switch (type) {
    case "scheduled":
      if (!walkDate) return null;
      return (
        <XStack width="100%" alignItems="center">
          <YStack>
            <XStack alignItems="center" gap="$2">
              <CalendarClock size={15} color="white" />
              <Text color="white" fontSize="$3" fontWeight="bold">
                Start time:
              </Text>
              <Text color="white" fontSize="$3">
                {getSmartDateFormat(walkDate)}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      );

    case "countdown":
      if (!walkDate || timeUntilWalk === undefined) return null;
      return (
        <XStack width="100%" justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$2">
            <Clock size={15} color="white" />
            <Text color="white" fontSize="$3" fontWeight="bold">
              Starting in:
            </Text>
            <Text color="white" fontSize="$3">
              {formatTime(timeUntilWalk)}
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <Calendar size={15} color="white" />
            <Text color="white" fontSize="$3">
              {getSmartDateFormat(walkDate)}
            </Text>
          </XStack>
        </XStack>
      );

    case "active":
      if (elapsedSeconds === undefined) return null;
      return (
        <XStack alignItems="center" gap="$2">
          <Clock size={15} color="white" />
          <Text color="white" fontSize="$3" fontWeight="bold">
            Walk time:
          </Text>
          <Text color="white" fontSize="$3">
            {formatTime(elapsedSeconds)}
          </Text>
        </XStack>
      );

    case "completed":
      if (durationSeconds === undefined) return null;
      return (
        <XStack alignItems="center" gap="$2">
          <CheckCircle size={15} color="white" />
          <Text color="white" fontSize="$3" fontWeight="bold">
            Walk completed:
          </Text>
          <Text color="white" fontSize="$3">
            {formatTime(durationSeconds)}
          </Text>
        </XStack>
      );

    default:
      return null;
  }
}
