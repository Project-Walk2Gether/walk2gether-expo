import React from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";

interface Props {
  round: Round | WithId<Round>;
  userPair: any;
  partnerNames: string[];
}

export default function CompletedRoundCard({
  round,
  userPair,
  partnerNames,
}: Props) {
  return (
    <Card
      pressStyle={{ opacity: 0.8 }}
      borderWidth={1}
      borderColor="$gray5"
      borderRadius={8}
      padding="$2"
      marginVertical="$1"
      width="100%"
    >
      <YStack justifyContent="space-between">
        <XStack mb="$2" gap="$2" alignItems="center" flex={1}>
          <Text
            fontSize={16}
            color={userPair.color}
            backgroundColor={`${userPair.color}20`} // 20% opacity of the color
            borderRadius={4}
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            {userPair.emoji}
          </Text>
          <XStack gap="$2">
            <Text fontSize={14} fontWeight="500">
              Round {round.roundNumber}
            </Text>
            <Text fontSize={12} color="$gray10" numberOfLines={1}>
              {partnerNames.length > 0
                ? `Partner: ${partnerNames.join(", ")}`
                : "No partner"}
            </Text>
          </XStack>
        </XStack>

        {round.questionPrompt && (
          <Text
            fontSize={12}
            color="$blue11"
            flex={1}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {round.questionPrompt}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
