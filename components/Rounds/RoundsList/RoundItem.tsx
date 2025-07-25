import { ChevronDown, ChevronUp, Edit3 as Edit } from "@tamagui/lucide-icons";
import React, { memo } from "react";
import { ScrollView } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";
import { COLORS } from "./constants";
import { PairCard } from "./PairCard";

interface Props {
  round: Round | WithId<Round>;
  index: number;
  isExpanded: boolean;
  isActual: boolean; // Flag to distinguish between actual and upcoming rounds
  isFirstUpcoming?: boolean; // Flag to indicate if this is the first upcoming round
  isWalkOwner?: boolean; // Flag to indicate if the current user is the walk owner
  onToggleExpand: () => void;
  onEditPrompt?: () => void; // Optional since only upcoming rounds can be edited
  onStartRound?: () => void; // Function to start this round (only for first upcoming round)
  isRotating?: boolean; // Flag to indicate if rotation is in progress
}

export const RoundItem = memo(
  ({
    round,
    index,
    isExpanded,
    isActual,
    isFirstUpcoming,
    isWalkOwner,
    onToggleExpand,
    onEditPrompt,
    onStartRound,
    isRotating,
  }: Props) => {
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

    return (
      <Card
        key={`round-${index}`}
        backgroundColor={cardBackgroundColor}
        marginBottom="$3"
        borderRadius="$4"
        onPress={onToggleExpand}
        pressStyle={{ opacity: 0.9 }}
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

          <XStack gap="$2" alignItems="center">
            {onEditPrompt && (
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
        {isExpanded && (
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
);
