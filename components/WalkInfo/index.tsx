import { differenceInSeconds } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

import React, { useEffect, useState } from "react";
import { Text, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import { LocationRow } from "./LocationRow";
import { TimeRow } from "./TimeRow";

interface Props {
  walk: Walk;
}

export default function WalkInfo({ walk }: Props) {
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

  // Check if there are meetup location notes to display
  const hasLocationNotes = !!walk.startLocation?.notes;

  // Calculate content based on walk state
  const renderTimerContent = () => {
    // If the walk has ended
    if (hasEnded) {
      const endTime = walk.endedAt?.toDate();
      const startTime = walk.startedAt?.toDate();

      if (endTime && startTime) {
        const durationSeconds = differenceInSeconds(endTime, startTime);
        return (
          <TimeRow 
            type="completed"
            durationSeconds={durationSeconds}
            formatTime={formatTime}
          />
        );
      }
    }

    // If the walk has started but not ended
    if (hasStarted && !hasEnded) {
      const startTime = walk.startedAt?.toDate();

      if (startTime) {
        const elapsedSeconds = differenceInSeconds(currentTime, startTime);
        return (
          <TimeRow 
            type="active"
            elapsedSeconds={elapsedSeconds}
            formatTime={formatTime}
          />
        );
      }
    }

    // If the walk is in the future
    if (walkDate && walkDate > currentTime) {
      const timeUntilWalk = differenceInSeconds(walkDate, currentTime);
      return (
        <TimeRow 
          type="countdown"
          walkDate={walkDate}
          timeUntilWalk={timeUntilWalk}
          formatTime={formatTime}
        />
      );
    }

    // If the walk date has passed but it hasn't started
    if (walkDate && walkDate <= currentTime && !hasStarted) {
      return (
        <TimeRow 
          type="scheduled"
          walkDate={walkDate}
          formatTime={formatTime}
        />
      );
    }

    // Default case
    return (
      <Text color="white" fontSize="$3" fontWeight="bold">
        Loading walk information...
      </Text>
    );
  };

  // Render location notes if they exist (only before the walk has started)
  const renderLocationNotes = () => {
    // Only show meetup notes if they exist AND the walk hasn't started yet
    if (!hasLocationNotes || hasStarted) return null;

    return (
      <LocationRow 
        locationName={walk.startLocation?.name}
        notes={walk.startLocation?.notes}
        latitude={walk.startLocation?.latitude}
        longitude={walk.startLocation?.longitude}
      />
    );
  };

  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        paddingVertical: 12,
      }}
    >
      <YStack gap="$2" paddingHorizontal={16}>
        {renderTimerContent()}
        {renderLocationNotes()}
      </YStack>
    </LinearGradient>
  );
}
