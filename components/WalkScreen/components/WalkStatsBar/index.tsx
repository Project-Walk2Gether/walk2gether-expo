import { useInterval } from "@/hooks/useInterval";
import { Clock, MapPin, Timer } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Text, View } from "tamagui";
import { Walk } from "walk2gether-shared/src/schemas/walk";

interface Props {
  walk: Walk;
}

export default function WalkStatsBar({ walk }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live countdown
  useInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  if (!walk.startedAt || walk.endTime) {
    return null;
  }

  const startTime = walk.startedAt.toDate();
  const scheduledEndTime = new Date(startTime.getTime() + walk.durationMinutes * 60 * 1000);
  const hasWalkNaturallyEnded = currentTime > scheduledEndTime;
  
  // Cap time walked at the walk duration if walk has naturally ended
  const rawTimeWalked = Math.floor(
    (currentTime.getTime() - startTime.getTime()) / 1000 / 60
  ); // minutes
  const timeWalked = hasWalkNaturallyEnded 
    ? walk.durationMinutes 
    : Math.min(rawTimeWalked, walk.durationMinutes);

  // Calculate time left based on walk duration minus time walked
  const timeLeft = Math.max(0, walk.durationMinutes - timeWalked);

  const formatTime = (minutes: number) => {
    if (minutes < 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (distanceInMiles?: number) => {
    if (!distanceInMiles || distanceInMiles === 0) return "0 ft";

    const feet = distanceInMiles * 5280;
    if (feet < 1000) {
      return `${Math.round(feet)} ft`;
    } else {
      return `${distanceInMiles.toFixed(1)} mi`;
    }
  };

  // Get distance from walk route
  const distanceWalked = walk.route?.distance?.value || 0;

  return (
    <View 
      backgroundColor={hasWalkNaturallyEnded ? "$purple8" : "$blue8"} 
      paddingHorizontal="$4" 
      paddingVertical="$3"
    >
      <View
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Time Walked */}
        <View flexDirection="row" alignItems="center" flex={1}>
          <Clock size={16} color="white" />
          <View marginLeft="$2">
            <Text fontSize="$2" color="white" opacity={0.8}>
              {hasWalkNaturallyEnded ? "Walk Completed" : "Time Walked"}
            </Text>
            <Text fontSize="$3" fontWeight="600" color="white">
              {formatTime(timeWalked)}
            </Text>
          </View>
        </View>

        {/* Distance Walked */}
        <View
          flexDirection="row"
          alignItems="center"
          flex={1}
          justifyContent="center"
        >
          <MapPin size={16} color="white" />
          <View marginLeft="$2">
            <Text fontSize="$2" color="white" opacity={0.8}>
              Distance
            </Text>
            <Text fontSize="$3" fontWeight="600" color="white">
              {formatDistance(distanceWalked)}
            </Text>
          </View>
        </View>

        {/* Time Left */}
        <View
          flexDirection="row"
          alignItems="center"
          flex={1}
          justifyContent="flex-end"
        >
          <Timer size={16} color="white" />
          <View marginLeft="$2">
            <Text fontSize="$2" color="white" opacity={0.8}>
              {hasWalkNaturallyEnded ? "Status" : "Time Left"}
            </Text>
            <Text fontSize="$3" fontWeight="600" color="white">
              {hasWalkNaturallyEnded ? "Ended" : formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
