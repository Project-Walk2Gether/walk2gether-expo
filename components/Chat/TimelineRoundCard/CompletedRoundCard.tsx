import React from "react";
import { ColorValue } from "react-native";
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
  // Use the user pair color as background if available, otherwise use default styling
  const hasColor = userPair?.color && typeof userPair.color === "string";

  return (
    <Card
      pressStyle={{ opacity: 0.8 }}
      borderWidth={1}
      borderColor={hasColor ? userPair.color : "$gray5"}
      borderRadius={8}
      padding="$2"
      marginVertical="$1"
      width="100%"
      backgroundColor={hasColor ? (userPair.color as ColorValue) : undefined}
    >
      <YStack justifyContent="space-between">
        <XStack gap="$2" alignItems="center" flex={1} flexShrink={1}>
          <Text
            fontSize={16}
            color={hasColor ? "white" : userPair.color}
            backgroundColor={
              hasColor ? "rgba(255, 255, 255, 0.2)" : `${userPair.color}20`
            }
            borderRadius={4}
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            {userPair.emoji}
          </Text>
          <XStack alignItems="center" flexShrink={1} gap="$3">
            <Text
              fontSize={14}
              fontWeight="bold"
              color={hasColor ? "white" : undefined}
            >
              Round {round.roundNumber}
            </Text>
            <Text
              fontSize={12}
              color={hasColor ? "white" : "$gray10"}
              numberOfLines={2}
              flexShrink={1}
            >
              {partnerNames.length > 0 ? partnerNames.join(", ") : "No partner"}
            </Text>
          </XStack>
        </XStack>

        {round.questionPrompt && (
          <Text
            fontSize={12}
            color={hasColor ? "white" : "$blue11"}
            flex={1}
            numberOfLines={1}
            ellipsizeMode="tail"
            flexShrink={1}
          >
            {round.questionPrompt}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
