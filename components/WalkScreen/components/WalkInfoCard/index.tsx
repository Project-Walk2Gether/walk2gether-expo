import { COLORS } from "@/styles/colors";
import { Calendar, Clock, MapPin, Timer } from "@tamagui/lucide-icons";
import { format, formatDistanceToNow } from "date-fns";
import React from "react";
import { Text, YStack } from "tamagui";
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
}

/**
 * Card component that displays walk details including time and location information
 */
export default function WalkDetailsCard({
  walkDate,
  durationMinutes = 60,
  location,
  locationName,
  notes,
  showMap = true,
  children,
}: Props) {
  // Check if time or location is missing
  const hasTimeInfo = !!walkDate;
  const hasLocationInfo = !!(
    location &&
    location.latitude &&
    location.longitude
  );

  if (!hasTimeInfo && !hasLocationInfo) {
    return (
      <WalkDetailsCardBase title="Walk Details" testID="walk-details-card">
        <Text>Walk details not specified</Text>
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

  // Location information
  let displayName = "";
  let hasCoordinates = false;
  if (location) {
    const { latitude, longitude } = location;
    displayName = locationName || "Meeting point";
    hasCoordinates = Boolean(latitude && longitude);
  }

  // Create a header action based on available information
  let headerAction;
  if (walkDate) {
    headerAction = (
      <Text fontSize="$3" color={COLORS.primary} fontWeight="500">
        {timeUntil}
      </Text>
    );
  }

  return (
    <WalkDetailsCardBase
      title="Walk Details"
      testID="walk-details-card"
      headerAction={headerAction}
    >
      <YStack w="100%" space="$3">
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

        {/* Location Information Section */}
        {hasLocationInfo && (
          <WalkDetailsRow
            icon={<MapPin />}
            label={displayName}
            sublabel={notes}
            testID="walk-location-row"
          />
        )}

        {children}
      </YStack>
    </WalkDetailsCardBase>
  );
}
