import { format } from "date-fns";
import React from "react";
import { Clock, Calendar } from "@tamagui/lucide-icons";
import { Text, XStack } from "tamagui";

interface Props {
  timeUntilWalk: number;
  walkDate: Date;
  formatTime: (seconds: number) => string;
}

export function TimerRow({ timeUntilWalk, walkDate, formatTime }: Props) {
  return (
    <XStack justifyContent="space-between" width="100%" alignItems="center">
      <XStack alignItems="center" gap="$2">
        <Clock size="$1" color="white" />
        <Text color="white" fontSize="$3" fontWeight="bold">
          Starting in: {formatTime(timeUntilWalk)}
        </Text>
      </XStack>
      <XStack alignItems="center" gap="$2">
        <Calendar size="$1" color="white" />
        <Text color="white" fontSize="$2">
          {format(walkDate, "MMM d, h:mm a")}
        </Text>
      </XStack>
    </XStack>
  );
}
