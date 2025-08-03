import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { openLocationInMaps } from "@/utils/locationUtils";
import { ArrowRight, Navigation } from "@tamagui/lucide-icons";
import { differenceInSeconds, format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";

interface Props {
  walk: Walk;
}

export default function WalkInfo({ walk }: Props) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get the participant document for the current user
  const { doc: participantDoc } = useDoc<Participant>(
    user?.uid ? `walks/${walk.id}/participants/${user.uid}` : undefined
  );

  // Update the timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get the walk date as a Date object
  const walkDate = walk.date?.toDate();
  // Check if the walk has started
  const hasStarted = !!walk.startedAt;
  // Check if the walk has ended
  const hasEnded = !!walk.endTime;

  // Function to format the time difference
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Helper function to render the time information based on walk state
  const getTimeDisplay = () => {
    // If the walk has ended
    if (hasEnded) {
      const endTime = walk.endTime?.toDate();
      const startTime = walk.startedAt?.toDate();

      if (endTime && startTime) {
        const durationSeconds = differenceInSeconds(endTime, startTime);
        return `Walked for ${formatTime(durationSeconds)}`;
      }
    }

    // If the walk has started but not ended
    if (hasStarted && !hasEnded) {
      const startTime = walk.startedAt?.toDate();

      if (startTime) {
        const elapsedSeconds = differenceInSeconds(currentTime, startTime);
        return `Walk time: ${formatTime(elapsedSeconds)}`;
      }
    }

    // If the walk is in the future
    if (walkDate && walkDate > currentTime) {
      const timeUntilWalk = differenceInSeconds(walkDate, currentTime);
      return `Starting in ${formatTime(timeUntilWalk)}`;
    }

    // If the walk date has passed but it hasn't started
    if (walkDate && walkDate <= currentTime && !hasStarted) {
      // Calculate how long ago the walk was scheduled to start
      const minutesAgo = Math.floor(
        differenceInSeconds(currentTime, walkDate) / 60
      );

      // Show "Scheduled to start now" when it's exactly the scheduled time
      if (minutesAgo === 0) {
        return "Scheduled to start now";
      }

      return `Scheduled to start ${minutesAgo} min${
        minutesAgo !== 1 ? "s" : ""
      } ago`;
    }

    return "Loading...";
  };

  // Check if navigation is possible
  const hasLocation =
    !!walk.startLocation?.latitude && !!walk.startLocation?.longitude;

  // Check if the user has arrived
  const hasArrived = participantDoc?.status === "arrived";

  // Function to navigate to the location
  const handleNavigate = () => {
    if (walk.startLocation?.latitude && walk.startLocation?.longitude) {
      openLocationInMaps(
        walk.startLocation.latitude,
        walk.startLocation.longitude,
        walk.startLocation.name
      );
    }
  };

  // Define a fixed width for the left column
  const leftColumnWidth = 24;

  return (
    <YStack gap="$3">
      {/* Main Walk Info Card */}
      <YStack
        backgroundColor={COLORS.secondary}
        paddingVertical="$3"
        paddingHorizontal="$3"
        gap="$2"
        borderRadius="$4"
      >
        {/* First XStack: arrow -> time display -> secondary time */}
        <XStack alignItems="center" justifyContent="space-between">
          {/* Arrow icon with fixed width */}
          <XStack
            width={leftColumnWidth}
            alignItems="center"
            justifyContent="flex-start"
          >
            <XStack
              width={16}
              height={16}
              borderRadius={12}
              backgroundColor="white"
              alignItems="center"
              justifyContent="center"
            >
              <ArrowRight size={10} color="#5b4c3e" />
            </XStack>
          </XStack>

          {/* Main time display (flexible width) */}
          <Text flex={1} color="white" fontSize="$4" fontWeight="bold">
            {getTimeDisplay()}
          </Text>

          {/* Secondary time display */}
          {walkDate && (
            <Text
              pr="$1"
              color="white"
              fontSize="$4"
              opacity={0.9}
              textAlign="right"
            >
              {hasEnded && walk.startedAt && walk.endTime
                ? // For completed walks, show the full range
                  `${format(walk.startedAt.toDate(), "h:mm a")} - ${format(
                    walk.endTime.toDate(),
                    "h:mm a"
                  )}`
                : // For all other walks, show the start time
                  `${format(walkDate, "h:mm a")}`}
            </Text>
          )}
        </XStack>

        {/* Location information: only shown before walk starts */}
        {!hasStarted && (
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center" flexShrink={1}>
              {walk.startLocation && (
                <YStack flexGrow={1} flexShrink={1}>
                  <Text color="white" fontSize="$3">
                    {walk.startLocation.name || "Meeting point"}
                  </Text>
                </YStack>
              )}

              {/* Navigate button - only shown before walk starts and if user hasn't arrived */}
              {hasLocation && !hasArrived && (
                <Button
                  flexShrink={0}
                  size="$2"
                  icon={<Navigation color="white" />}
                  onPress={handleNavigate}
                  backgroundColor="#4BB4E6"
                  color="white"
                  fontWeight="bold"
                >
                  Open in Maps
                </Button>
              )}
            </XStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
