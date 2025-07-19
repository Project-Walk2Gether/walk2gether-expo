import { COLORS } from "@/styles/colors";
import { Calendar, Clock, Timer } from "@tamagui/lucide-icons";
import { format, formatDistanceToNow } from "date-fns";
import React from "react";
import { Text, YStack } from "tamagui";
import WalkDetailsCard from "../WalkDetailsCard";
import WalkDetailsRow from "../WalkDetailsRow";

interface Props {
  walkDate?: Date;
  durationMinutes?: number;
}

/**
 * Card component that displays walk time information
 */
export default function WalkTimeCard({
  walkDate,
  durationMinutes = 60,
}: Props) {
  if (!walkDate) {
    return (
      <WalkDetailsCard title="Walk Time" testID="walk-time-card">
        <Text>Time not specified</Text>
      </WalkDetailsCard>
    );
  }

  const walkDateTime = walkDate;
  const timeUntil = formatDistanceToNow(walkDateTime, { addSuffix: true });
  const formattedDate = format(walkDateTime, "EEEE, MMMM d, yyyy");
  const formattedTime = format(walkDateTime, "h:mm a");

  // Create a header action to match the location card style
  const headerAction = (
    <Text fontSize="$3" color={COLORS.primary} fontWeight="500">
      {timeUntil}
    </Text>
  );

  return (
    <WalkDetailsCard
      title="Walk Time"
      testID="walk-time-card"
      headerAction={headerAction}
    >
      <YStack w="100%" space="$3">
        {/* Date Info */}
        <WalkDetailsRow
          icon={<Calendar />}
          label={formattedDate}
          testID="walk-date-row"
        />

        {/* Time Info */}
        <WalkDetailsRow
          icon={<Clock />}
          label={formattedTime}
          testID="walk-time-row"
        />

        {/* Duration Info */}
        <WalkDetailsRow
          icon={<Timer />}
          label={`Duration: ${durationMinutes} minutes`}
          testID="walk-duration-row"
        />
      </YStack>
    </WalkDetailsCard>
  );
}
