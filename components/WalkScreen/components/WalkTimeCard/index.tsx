import { COLORS } from "@/styles/colors";
import { Calendar, Clock, Edit3, Timer } from "@tamagui/lucide-icons";
import { format, formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { Button, Text, YStack } from "tamagui";
import { Location } from "walk2gether-shared";
import WalkDetailsCardBase from "../WalkDetailsCard";
import WalkDetailsRow from "../WalkDetailsRow";

interface Props {
  walkDate?: Date;
  durationMinutes?: number;
  location?: Location;
  locationName?: string;
  notes?: string;
  showMap?: boolean;
  children?: React.ReactNode;
  walkId?: string;
  showEditButton?: boolean;
}

/**
 * Card component that displays walk details including time and location information
 */
export default function WalkTimeCard({
  walkDate,
  durationMinutes = 60,
  walkId,
  showEditButton = false,
  children,
}: Props) {
  // Check if time or location is missing
  const hasTimeInfo = !!walkDate;

  if (!hasTimeInfo) {
    return (
      <WalkDetailsCardBase title="Walk Details" testID="walk-details-card">
        <Text>Walk time not specified</Text>
      </WalkDetailsCardBase>
    );
  }

  // Time information
  let timeUntil = "",
    formattedDate = "",
    formattedTime = "";
  if (walkDate) {
    const walkDateTime = walkDate;
    timeUntil = formatDistanceToNow(walkDateTime, { addSuffix: true });
    formattedDate = format(walkDateTime, "EEEE, MMMM d, yyyy");
    formattedTime = format(walkDateTime, "h:mm a");
  }

  // Create a header action based on available information
  let headerAction;
  if (showEditButton && walkId) {
    headerAction = (
      <Button
        size="$2"
        circular
        icon={<Edit3 size={16} />}
        onPress={() =>
          router.push(`/(app)/(modals)/edit-walk-time?id=${walkId}`)
        }
      />
    );
  } else if (walkDate) {
    headerAction = (
      <Text fontSize="$3" color={COLORS.primary} fontWeight="500">
        {timeUntil}
      </Text>
    );
  }

  return (
    <WalkDetailsCardBase
      title="Time"
      testID="walk-details-card"
      headerAction={headerAction}
    >
      <YStack w="100%" gap="$3">
        {/* Time Information Section */}

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

        {children}
      </YStack>
    </WalkDetailsCardBase>
  );
}
