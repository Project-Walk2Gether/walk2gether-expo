import RoundCountdown from "@/components/Rounds/RoundCountdown";
import { useWalk } from "@/context/WalkContext";
import { Expand } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Stack, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";

interface Props {
  round: Round | WithId<Round>;
  currentUserId?: string;
  userPair: any;
  partnerNames: string[];
}

export default function ActiveRoundCard({
  round,
  currentUserId,
  userPair,
  partnerNames,
}: Props) {
  const { walk } = useWalk();
  const router = useRouter();

  // Navigation function for tapping on active round
  const navigateToRoundDetail = () => {
    if (walk?._ref) {
      const walkIdParts = walk._ref.path.split("/");
      const walkId = walkIdParts[walkIdParts.length - 1];
      router.push({
        pathname: "/(app)/(modals)/walk-round",
        params: { walkId },
      });
    }
  };

  return (
    <Stack
      px="$2"
      py="$2"
      backgroundColor={userPair.color}
      pressStyle={{ opacity: 0.9 }}
      onPress={navigateToRoundDetail}
      borderRadius={8}
      marginVertical="$2"
      width="100%"
      position="relative"
    >
      {/* Top row: Round title, emoji, countdown, and expand icon */}
      <XStack
        alignItems="center"
        justifyContent="center"
        position="relative"
        paddingVertical="$3"
      >
        {/* Round title on the left */}
        <XStack position="absolute" left="$2" alignItems="center">
          <Text fontSize="$4" fontWeight="bold" color="white">
            Round {round.roundNumber}
          </Text>
        </XStack>

        {/* Center emoji */}
        <Text fontSize={100}>{userPair.emoji}</Text>

        {/* Expand icon to navigate to round detail */}
        <XStack position="absolute" right="$2" top="-$2">
          <Button
            size="$2"
            circular
            backgroundColor="rgba(255,255,255,0.2)"
            borderWidth={0}
            onPress={navigateToRoundDetail}
          >
            <Expand size={16} color="white" />
          </Button>
        </XStack>
      </XStack>

      {/* Bottom row: Partner names and question prompt */}
      <YStack paddingBottom="$3" paddingHorizontal="$2" gap="$3">
        {/* Partner names in prominent box */}
        <XStack justifyContent="center">
          <YStack
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$3"
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.3)"
            gap="$2"
          >
            <Text
              fontSize="$2"
              fontWeight="600"
              color="white"
              opacity={0.8}
              textAlign="center"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              You're paired with
            </Text>
            <Text
              fontSize="$5"
              fontWeight="600"
              color="white"
              textAlign="center"
            >
              {partnerNames.length > 0
                ? partnerNames.join(" & ")
                : "No partner assigned"}
            </Text>
            <Text fontSize="$3" color="white" opacity={0.9} textAlign="center">
              Look for the same color and emoji to connect!
            </Text>
          </YStack>
        </XStack>

        {/* Countdown timer centered */}
        {round.startTime && (
          <XStack justifyContent="center">
            <RoundCountdown
              startTime={round.startTime}
              endTime={round.endTime}
            />
          </XStack>
        )}

        {/* Discussion prompt section */}
        {round.questionPrompt && (
          <YStack gap="$2" alignItems="center">
            <Text
              fontSize="$2"
              fontWeight="600"
              color="white"
              opacity={0.8}
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              Discussion Prompt
            </Text>
            <Text
              fontSize="$3"
              color="white"
              textAlign="center"
              numberOfLines={3}
              ellipsizeMode="tail"
              lineHeight={20}
            >
              {round.questionPrompt}
            </Text>
          </YStack>
        )}
      </YStack>
    </Stack>
  );
}
