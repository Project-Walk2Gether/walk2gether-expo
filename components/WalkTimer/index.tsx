import { differenceInSeconds, format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Text, XStack } from "tamagui";
import { Walk } from "walk2gether-shared";

interface Props {
  walk: Walk;
}

export default function WalkTimer({ walk }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());

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
  const hasEnded = !!walk.endedAt;

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

  // Calculate content based on walk state
  const renderTimerContent = () => {
    // If the walk has ended
    if (hasEnded) {
      const endTime = walk.endedAt?.toDate();
      const startTime = walk.startedAt?.toDate();

      if (endTime && startTime) {
        const durationSeconds = differenceInSeconds(endTime, startTime);
        return (
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            paddingHorizontal={15}
          >
            <Text color="white" fontSize="$3" fontWeight="bold">
              Duration: {formatTime(durationSeconds)}
            </Text>
          </XStack>
        );
      }
    }

    // If the walk has started but not ended
    if (hasStarted && !hasEnded) {
      const startTime = walk.startedAt?.toDate();

      if (startTime) {
        const elapsedSeconds = differenceInSeconds(currentTime, startTime);
        return (
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            paddingHorizontal={15}
          >
            <Text color="white" fontSize="$3" fontWeight="bold">
              Time elapsed: {formatTime(elapsedSeconds)}
            </Text>
          </XStack>
        );
      }
    }

    // If the walk is in the future
    if (walkDate && walkDate > currentTime) {
      const timeUntilWalk = differenceInSeconds(walkDate, currentTime);
      return (
        <XStack
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          px="$2"
        >
          <Text color="white" fontSize="$3" fontWeight="bold">
            Starting in: {formatTime(timeUntilWalk)}
          </Text>
          <Text color="white" fontSize="$2">
            {format(walkDate, "MMM d, h:mm a")}
          </Text>
        </XStack>
      );
    }

    // If the walk date has passed but it hasn't started
    if (walkDate && walkDate <= currentTime && !hasStarted) {
      return (
        <XStack
          justifyContent="center"
          alignItems="center"
          width="100%"
          paddingHorizontal={15}
        >
          <Text color="white" fontSize="$3" fontWeight="bold">
            Scheduled to start {format(walkDate, "h:mm a")}
          </Text>
        </XStack>
      );
    }

    // Default case
    return (
      <Text color="white" fontSize="$3" fontWeight="bold" textAlign="center">
        Loading walk information...
      </Text>
    );
  };

  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 10,
        paddingVertical: 10,
      }}
    >
      <XStack
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={10}
      >
        {renderTimerContent()}
      </XStack>
    </LinearGradient>
  );
}
