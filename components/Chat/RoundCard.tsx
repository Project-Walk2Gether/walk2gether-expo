import React from "react";
import { Dimensions } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";
import { Round as RoundType } from "walk2gether-shared";

interface RoundProps {
  round: RoundType;
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

  // Get partner names (excluding current user)
  const partnerNames = React.useMemo(() => {
    if (!userPair) return [];

    // This would need to be replaced with actual user data lookup
    // For now, we'll just show user IDs
    return userPair.userUids.filter((uid) => uid !== currentUserId);
  }, [userPair, currentUserId]);

  if (!userPair) {
    return null; // User not in any pair for this round
  }

  return (
    <Card
      onPress={onToggleActive}
      pressStyle={{ opacity: 0.8 }}
      backgroundColor={userPair.color + "20"} // Add transparency to the color
      borderColor={userPair.color}
      borderWidth={2}
      borderRadius={16}
      padding="$4"
      marginVertical="$2"
      width="100%"
      height={isActive ? SCREEN_HEIGHT * 0.5 : undefined}
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
          <Text fontSize={24}>{userPair.emoji}</Text>
        </XStack>

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

          {isActive && (
            <YStack marginTop="$4" space="$2">
              <Text fontSize={16} fontWeight="500" color="$gray11">
                This is the active round. Tap to collapse.
              </Text>
              <Text fontSize={14} color="$gray10">
                Messages you send now will be answers to the question prompt.
              </Text>
            </YStack>
          )}
        </YStack>
    </Card>
  );
}
