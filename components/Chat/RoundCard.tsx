import { useWalk } from "@/context/WalkContext";
import React from "react";
import { Dimensions } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";

interface RoundProps {
  round: WithId<Round>;
  currentUserId: string;
  isActive: boolean;
  onToggleActive: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RoundCard({
  round,
  currentUserId,
  isActive,
  onToggleActive,
}: RoundProps) {
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
      onPress={onToggleActive}
      pressStyle={{ opacity: 0.8 }}
      borderWidth={isActive ? 2 : 1}
      borderRadius={16}
      padding="$4"
      marginVertical="$2"
      width="100%"
      animation="bouncy"
      animateOnly={["height"]}
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$2"
      >
        <Text fontSize={16} fontWeight="bold">
          Round {round.roundNumber}
        </Text>
        <Text fontSize={isActive ? 48 : 24}>{userPair.emoji}</Text>
      </XStack>

      {isActive && (
        <YStack alignItems="center" marginVertical="$4">
          <Text fontSize={150} marginBottom="$2">
            {userPair.emoji}
          </Text>
          <Text fontSize={14} color="$gray10">
            Show this emoji to find your partner
          </Text>
        </YStack>
      )}

      <YStack space="$2">
        <Text fontSize={14} fontWeight="500">
          Your pair:{" "}
          {partnerNames.length > 0
            ? partnerNames.join(", ")
            : "No partner assigned"}
        </Text>

        {round.questionPrompt && (
          <YStack
            backgroundColor="$blue2"
            padding="$3"
            borderRadius={12}
            marginTop="$2"
          >
            <Text
              fontSize={isActive ? 18 : 14}
              fontWeight="600"
              color="$blue11"
            >
              Question: {round.questionPrompt}
            </Text>
          </YStack>
        )}
      </YStack>
    </Card>
  );
}
