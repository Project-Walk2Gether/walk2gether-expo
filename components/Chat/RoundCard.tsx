import { useWalk } from "@/context/WalkContext";
import React from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";

interface RoundProps {
  round: WithId<Round>;
  currentUserId: string;
  onToggleActive: () => void;
}

export default function RoundCard({ round, currentUserId }: RoundProps) {
  // Find the current user's pair
  const userPair = React.useMemo(() => {
    return round.pairs.find((pair) => pair.userUids.includes(currentUserId));
  }, [round.pairs, currentUserId]);

  // Get walk context to access participant data
  const { walk } = useWalk();

  // Get partner names (excluding current user)
  const partnerNames = React.useMemo(() => {
    if (!userPair || !walk?.participantsById) return [];

    // Filter out current user and map to participant names from walk context
    return userPair.userUids
      .filter((uid) => uid !== currentUserId)
      .map((uid) => walk.participantsById[uid]?.displayName);
  }, [userPair, currentUserId, walk?.participantsById]);

  if (!userPair) {
    return null; // User not in any pair for this round
  }

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
      <XStack justifyContent="space-between" alignItems="center">
        <XStack space="$2" alignItems="center" flex={1}>
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
          <YStack>
            <Text fontSize={14} fontWeight="500">
              Round {round.roundNumber}
            </Text>
            <Text fontSize={12} color="$gray10" numberOfLines={1}>
              {partnerNames.length > 0
                ? `Partner: ${partnerNames.join(", ")}`
                : "No partner"}
            </Text>
          </YStack>
        </XStack>

        {round.questionPrompt && (
          <Text
            fontSize={12}
            color="$blue11"
            flex={1}
            numberOfLines={1}
            ellipsizeMode="tail"
            textAlign="right"
          >
            {round.questionPrompt}
          </Text>
        )}
      </XStack>
    </Card>
  );
}
