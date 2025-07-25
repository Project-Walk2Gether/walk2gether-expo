import { useWalk } from "@/context/WalkContext";
import { ChevronDown, ChevronUp, Edit3 as Edit } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";
import { PairCard } from "../Rounds/RoundsList/PairCard";

// Colors from RoundsList constants
const COLORS = {
  primary: "$blue9",
  text: "$blue11",
};

interface Props {
  round: Round | WithId<Round>;
  currentUserId?: string;
  isExpanded?: boolean;
  isActual?: boolean;
  isFirstUpcoming?: boolean;
  isWalkOwner?: boolean;
  onToggleExpand?: () => void;
  onEditPrompt?: () => void;
  onStartRound?: () => void;
  isRotating?: boolean;
  simplified?: boolean; // For timeline view to show simplified version
}

export default function RoundCard({
  round,
  currentUserId,
  isExpanded = false,
  isActual = true,
  isFirstUpcoming = false,
  isWalkOwner = false,
  onToggleExpand,
  onEditPrompt,
  onStartRound,
  isRotating = false,
  simplified = false,
}: Props) {
  // Get walk context to access participant data when in simplified mode
  const { walk } = useWalk();
  
  // Determine styling based on whether this is an actual or upcoming round
  const cardBackgroundColor = isFirstUpcoming
    ? "$blue2"
    : isActual
    ? "$gray1"
    : "$blue1";
  const textColor = isActual ? "$gray11" : COLORS.text;
  const iconColor = isActual ? "$gray9" : COLORS.primary;
  
  // Check if this is the currently active round (has startTime but no endTime)
  const isActiveRound = isActual && round.startTime && !round.endTime;

  // Find the current user's pair (only needed in simplified mode)
  const userPair = React.useMemo(() => {
    if (!currentUserId || !simplified) return null;
    return round.pairs?.find((pair) => pair.userUids.includes(currentUserId));
  }, [round.pairs, currentUserId, simplified]);

  // Get partner names (excluding current user) - only for simplified mode
  const partnerNames = React.useMemo(() => {
    if (!userPair || !walk?.participantsById || !simplified) return [];

    // Filter out current user and map to participant names from walk context
    return userPair.userUids
      .filter((uid) => uid !== currentUserId)
      .map((uid) => walk.participantsById[uid]?.displayName);
  }, [userPair, currentUserId, walk?.participantsById, simplified]);

  // For simplified mode in timeline, show condensed version
  if (simplified && userPair) {
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

  // For full mode (in RoundsList)
  return (
    <Card
      key={`round-${round.roundNumber}`}
      backgroundColor={cardBackgroundColor}
      marginBottom="$3"
      borderRadius="$4"
      onPress={onToggleExpand}
      pressStyle={onToggleExpand ? { opacity: 0.9 } : undefined}
      borderColor={isActual ? "$gray3" : "$blue3"}
      borderWidth={1}
    >
      <XStack
        px="$4"
        py="$2"
        justifyContent="space-between"
        alignItems="center"
      >
        <XStack space="$2" alignItems="center">
          <Text fontWeight="bold" color={textColor}>
            Round {round.roundNumber}
          </Text>
          
          {/* Status indicator */}
          {isActiveRound && (
            <XStack 
              backgroundColor="$green2" 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              borderRadius="$2"
              alignItems="center"
            >
              <Text fontSize="$1" color="$green9" fontWeight="bold">
                ACTIVE
              </Text>
            </XStack>
          )}
          
          {!isActual && (
            <XStack 
              backgroundColor="$blue2" 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              borderRadius="$2"
              alignItems="center"
            >
              <Text fontSize="$1" color="$blue9" fontWeight="bold">
                UPCOMING
              </Text>
            </XStack>
          )}
          
          {isActual && !isActiveRound && (
            <XStack 
              backgroundColor="$gray2" 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              borderRadius="$2"
              alignItems="center"
            >
              <Text fontSize="$1" color="$gray9" fontWeight="bold">
                COMPLETED
              </Text>
            </XStack>
          )}
          
          {/* Time indicator */}
          {isActual && round.startTime && (
            <Text fontSize="$1" color="$gray8">
              {round.startTime.toDate
                ? round.startTime.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown time"}
            </Text>
          )}
        </XStack>

        {onToggleExpand && (
          <XStack gap="$2" alignItems="center">
            {onEditPrompt && !isActual && (
              <Button
                size="$2"
                backgroundColor="transparent"
                icon={<Edit size={16} color={iconColor} />}
                onPress={onEditPrompt}
              />
            )}
            {isExpanded ? (
              <ChevronUp size={16} color={textColor} />
            ) : (
              <ChevronDown size={16} color={textColor} />
            )}
          </XStack>
        )}
      </XStack>

      {/* Question prompt */}
      {round.questionPrompt && (
        <YStack px="$4" marginTop="$1" marginBottom="$2">
          <Text fontStyle="italic" color={textColor}>
            "{round.questionPrompt}"
          </Text>
        </YStack>
      )}

      {/* Start Round button for first upcoming round */}
      {isFirstUpcoming && isWalkOwner && onStartRound && (
        <YStack paddingHorizontal="$4" paddingVertical="$2">
          <Button
            backgroundColor="$blue8"
            color="white"
            size="$3"
            onPress={onStartRound}
            disabled={isRotating}
            opacity={isRotating ? 0.7 : 1}
          >
            {isRotating ? "Starting round..." : "Start this round"}
          </Button>
        </YStack>
      )}

      {/* Expanded view with pairs */}
      {isExpanded && round.pairs && (
        <YStack 
          marginTop="$2" 
          marginBottom="$2" 
          paddingHorizontal="$4" 
          paddingBottom="$2" 
          space="$3"
        >
          <Text fontWeight="bold" color={textColor} fontSize="$3">
            Pairs
          </Text>
          <YStack space="$3">
            {round.pairs.map((pair, pairIndex) => (
              <PairCard
                key={`pair-${pairIndex}`}
                pair={pair}
                isActual={isActual}
              />
            ))}
          </YStack>
        </YStack>
      )}
    </Card>
  );
}
