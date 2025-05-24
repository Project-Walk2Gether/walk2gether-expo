import React from "react";
import { CheckCircle } from "@tamagui/lucide-icons";
import { Text, XStack } from "tamagui";

interface Props {
  durationSeconds: number;
  formatTime: (seconds: number) => string;
}

export function CompletedWalkRow({ durationSeconds, formatTime }: Props) {
  return (
    <XStack alignItems="center" gap="$2">
      <CheckCircle size="$1" color="white" />
      <Text color="white" fontSize="$3" fontWeight="bold">
        Walk completed:
      </Text>
      <Text color="white" fontSize="$3">
        {formatTime(durationSeconds)}
      </Text>
    </XStack>
  );
}
