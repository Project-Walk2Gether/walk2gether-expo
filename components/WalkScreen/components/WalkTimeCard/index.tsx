import { COLORS } from "@/styles/colors";
import { Calendar, Clock, Edit3, Timer } from "@tamagui/lucide-icons";
import { Timestamp } from "@react-native-firebase/firestore";
import { format, formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { Button, Text, YStack } from "tamagui";
import { Location, Participant, TimeOption, WithId } from "walk2gether-shared";
import { useMenu } from "@/context/MenuContext";
import AlternateTimesCard from "../AlternateTimesCard";
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
  timeOptions?: TimeOption[];
  participants?: WithId<Participant>[];
  isWalkOwner?: boolean;
}

/**
 * Card component that displays walk details including time and location information
 */
export default function WalkTimeCard({
  walkDate,
  durationMinutes = 60,
  walkId,
  showEditButton = false,
  timeOptions = [],
  participants = [],
  isWalkOwner = false,
  children,
}: Props) {
  const { showMenu } = useMenu();

  // Format duration helper function
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return hours === 1 ? "1 hour" : `${hours} hours`;
      } else {
        return `${hours} hr ${remainingMinutes} min`;
      }
    }
  };

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
        iconAfter={Edit3}
        theme="blue"
        onPress={() =>
          showMenu("Edit Time & Duration", [
            {
              label: "Edit Time",
              onPress: () => router.push(`/(app)/(modals)/edit-walk-time?id=${walkId}`),
            },
            {
              label: "Edit Duration",
              onPress: () => router.push(`/(app)/(modals)/edit-walk-duration?id=${walkId}`),
            },
          ])
        }
      >
        Edit
      </Button>
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
          label={formatDuration(durationMinutes)}
          testID="walk-duration-row"
        />

        {children}

        {/* Alternate Times Card - show if there are time options */}
        {timeOptions.length > 0 && walkDate && walkId && (
          <AlternateTimesCard
            walkId={walkId}
            timeOptions={timeOptions}
            participants={participants}
            isWalkOwner={isWalkOwner}
            currentWalkTime={Timestamp.fromDate(walkDate)}
          />
        )}
      </YStack>
    </WalkDetailsCardBase>
  );
}
