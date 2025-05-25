import { Calendar, CalendarClock, CheckCircle, Clock, MapPin } from "@tamagui/lucide-icons";
import { differenceInSeconds, format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Text, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import { WalkInfoRow, Section } from "./WalkInfoRow";

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
        const sections: Section[] = [
          {
            icon: <CheckCircle size="$1" color="white" />,
            label: "Walk completed",
            value: formatTime(durationSeconds)
          }
        ];
        return <WalkInfoRow sections={sections} />;
      }
    }

    // If the walk has started but not ended
    if (hasStarted && !hasEnded) {
      const startTime = walk.startedAt?.toDate();

      if (startTime) {
        const elapsedSeconds = differenceInSeconds(currentTime, startTime);
        const sections: Section[] = [
          {
            icon: <Clock size="$1" color="white" />,
            label: "Walk time",
            value: formatTime(elapsedSeconds)
          }
        ];
        return <WalkInfoRow sections={sections} />;
      }
    }

    // If the walk is in the future
    if (walkDate && walkDate > currentTime) {
      const timeUntilWalk = differenceInSeconds(walkDate, currentTime);
      const sections: Section[] = [
        {
          icon: <Clock size="$1" color="white" />,
          label: "Starting in",
          value: formatTime(timeUntilWalk)
        },
        {
          icon: <Calendar size="$1" color="white" />,
          label: format(walkDate, "MMM d, h:mm a"),
          fontWeight: "normal"
        }
      ];
      return <WalkInfoRow sections={sections} justifyContent="space-between" />;
    }

    // If the walk date has passed but it hasn't started
    if (walkDate && walkDate <= currentTime && !hasStarted) {
      const sections: Section[] = [
        {
          icon: <CalendarClock size="$1" color="white" />,
          label: "Scheduled to start",
          value: format(walkDate, "h:mm a")
        }
      ];
      return <WalkInfoRow sections={sections} />;
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

    const sections: Section[] = [
      {
        icon: <MapPin size="$1" color="white" />,
        label: "Meetup notes",
        value: walk.startLocation?.notes || "",
        fontWeight: "normal"
      }
    ];
    return <WalkInfoRow sections={sections} />;
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
      <YStack paddingHorizontal={16} space="$1">
        {renderTimerContent()}
        {renderLocationNotes()}
      </YStack>
    </LinearGradient>
  );
}
