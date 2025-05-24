import React from "react";
import { CalendarClock } from "@tamagui/lucide-icons";
import { Text, XStack } from "tamagui";
import { format } from "date-fns";

interface Props {
  walkDate: Date;
}

export function ScheduledWalkRow({ walkDate }: Props) {
  return (
    <XStack alignItems="center" gap="$2">
      <CalendarClock size="$1" color="white" />
      <Text color="white" fontSize="$3" fontWeight="bold">
        Scheduled to start:
      </Text>
      <Text color="white" fontSize="$3">
        {format(walkDate, "h:mm a")}
      </Text>
    </XStack>
  );
}
