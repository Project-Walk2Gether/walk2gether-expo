import { COLORS } from "@/styles/colors";
import React from "react";
import { Card, H4, Paragraph, XStack, YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { Walk } from "walk2gether-shared";

interface WalkStatsProps {
  walk: Walk;
}

/**
 * Component to display walk statistics like distance and duration
 * Only shown when a walk has ended (endedAt is set)
 */
export default function WalkStats({ walk }: WalkStatsProps) {
  // Only show stats if the walk has ended
  if (!walk.endedAt) {
    return null;
  }

  // Calculate total duration in minutes from startedAt to endedAt
  const startTime = walk.startedAt?.toDate();
  const endTime = walk.endedAt?.toDate();
  
  let totalDurationMinutes = 0;
  if (startTime && endTime) {
    const durationMs = endTime.getTime() - startTime.getTime();
    totalDurationMinutes = Math.round(durationMs / (1000 * 60));
  }

  // Format duration as hours and minutes
  const hours = Math.floor(totalDurationMinutes / 60);
  const minutes = totalDurationMinutes % 60;
  const durationText = hours > 0 
    ? `${hours} hr ${minutes} min` 
    : `${minutes} min`;

  // Format distance with up to 2 decimal places, but only if needed
  const distance = walk.totalDistanceMiles || 0;
  const formattedDistance = distance.toFixed(2).replace(/\.?0+$/, '');

  return (
    <Card 
      marginHorizontal="$4" 
      marginTop="$4"
      backgroundColor="#F9F9F9"
      borderColor={COLORS.primary}
      borderWidth={1}
      overflow="hidden"
      elevate
      bordered
    >
      <Card.Header backgroundColor={COLORS.primary} paddingVertical="$2">
        <H4 color="white" textAlign="center">Walk Summary</H4>
      </Card.Header>
      
      <YStack space="$2" padding="$4">
        <XStack alignItems="center" space="$2">
          <Ionicons name="map" size={24} color={COLORS.primary} />
          <Paragraph fontSize="$5" fontWeight="bold">
            {formattedDistance} miles
          </Paragraph>
          <Paragraph fontSize="$3" opacity={0.7}>total distance</Paragraph>
        </XStack>
        
        <XStack alignItems="center" space="$2">
          <Ionicons name="time" size={24} color={COLORS.primary} />
          <Paragraph fontSize="$5" fontWeight="bold">
            {durationText}
          </Paragraph>
          <Paragraph fontSize="$3" opacity={0.7}>total time</Paragraph>
        </XStack>
      </YStack>
    </Card>
  );
}
