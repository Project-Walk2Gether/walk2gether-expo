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
  isExpanded?: boolean;
  isActual?: boolean;
  isFirstUpcoming?: boolean;
  isWalkOwner?: boolean;
  onToggleExpand?: () => void;
  onEditPrompt?: () => void;
  onStartRound?: () => void;
  suggestedDuration?: number; // Duration in minutes
  isRotating?: boolean;
}

export default function RoundCard({
  round,
  isExpanded = false,
  isActual = true,
  isFirstUpcoming = false,
  isWalkOwner = false,
  onToggleExpand,
  onEditPrompt,
  onStartRound,
  suggestedDuration,
  isRotating = false,
}: Props) {
  // Determine styling based on whether this is an actual or upcoming round
  const cardBackgroundColor = isFirstUpcoming
    ? "$blue2"
    : isActual
    ? "$gray1"
    : "$blue1";
  const textColor = isActual ? "$gray11" : COLORS.text;
  const iconColor = isActual ? "$gray9" : COLORS.primary;

  // Check if this is the currently active round (has startTime but no endTime)
  const isActiveRound =
    isActual && (!round.endTime || round.endTime.toDate() > new Date());

  // Standard round card for RoundsList
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
        <XStack
          space="$2"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
        >
          <Text fontWeight="bold" color={textColor}>
            Round {round.roundNumber}
            {suggestedDuration && isFirstUpcoming
              ? ` (${suggestedDuration}min)`
              : ""}
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
        </XStack>

        <XStack gap="$2" alignItems="center">
          {onEditPrompt && (
            <Button
              size="$2"
              backgroundColor="transparent"
              icon={<Edit size={16} color={iconColor} />}
              onPress={onEditPrompt}
            />
          )}
          {onToggleExpand &&
            (isExpanded ? (
              <ChevronUp size={16} color={textColor} />
            ) : (
              <ChevronDown size={16} color={textColor} />
            ))}
        </XStack>
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
            {isRotating
              ? "Starting round..."
              : `Start Round (${suggestedDuration || 15} min)`}
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
