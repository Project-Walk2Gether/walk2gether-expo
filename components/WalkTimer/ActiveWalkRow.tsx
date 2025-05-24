import React from "react";
import { Clock } from "@tamagui/lucide-icons";
import { Text, XStack } from "tamagui";

interface Props {
  elapsedSeconds: number;
  formatTime: (seconds: number) => string;
}

export function ActiveWalkRow({ elapsedSeconds, formatTime }: Props) {
  return (
    <XStack alignItems="center" gap="$2">
      <Clock size="$1" color="white" />
      <Text color="white" fontSize="$3" fontWeight="bold">
        Walk time: {formatTime(elapsedSeconds)}
      </Text>
    </XStack>
  );
}
