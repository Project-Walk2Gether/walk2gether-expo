import React from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";

interface Props {
  round: Round | WithId<Round>;
  isFirstUpcoming?: boolean;
}

export default function UpcomingRoundCard({
  round,
  isFirstUpcoming = false,
}: Props) {
  return (
    <Card
      pressStyle={{ opacity: 0.8 }}
      borderWidth={1}
      borderColor={isFirstUpcoming ? "$blue6" : "$gray6"}
      borderRadius={8}
      padding="$3"
      marginVertical="$2"
      width="100%"
      position="relative"
    >
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$1">
            <XStack alignItems="center" gap="$2">
              <Text fontWeight="bold" color="$blue11">
                Round {round.roundNumber}
              </Text>

              <Text
                fontSize="$1"
                color={isFirstUpcoming ? "$blue9" : "$blue8"}
                fontWeight="bold"
                backgroundColor={isFirstUpcoming ? "$blue3" : "$blue2"}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
              >
                {isFirstUpcoming ? "NEXT" : "UPCOMING"}
              </Text>
            </XStack>
            {round.questionPrompt && (
              <Text
                fontSize="$3"
                color="$blue10"
                fontStyle="italic"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                "{round.questionPrompt}"
              </Text>
            )}
          </YStack>
        </XStack>

        {/* Upcoming round info - rounds now start automatically */}
        {isFirstUpcoming && (
          <XStack marginTop="$2">
            <Text fontSize="$2" color="$gray10" fontStyle="italic">
              This round will start automatically at the scheduled time
            </Text>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}
