import {
  ChevronDown,
  ChevronUp,
  Edit3 as Edit,
  Users,
} from "@tamagui/lucide-icons";
import React, { memo } from "react";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { Round } from "walk2gether-shared";
import { COLORS } from "./constants";
import { PairCard } from "./PairCard";

interface Props {
  round: Round;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditPrompt: () => void;
}

export const UpcomingRound = memo(
  ({ round, index, isExpanded, onToggleExpand, onEditPrompt }: Props) => {
    return (
      <Card
        key={`upcoming-round-${index}`}
        backgroundColor="$blue1"
        marginBottom="$3"
        borderRadius="$4"
        onPress={onToggleExpand}
        pressStyle={{ opacity: 0.9 }}
      >
        <XStack px="$4" justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">Round {round.roundNumber}</Text>

          <XStack gap="$2">
            <Button
              size="$2"
              backgroundColor="transparent"
              icon={<Edit size={16} color={COLORS.primary} />}
              onPress={onEditPrompt}
            />
            {isExpanded ? (
              <ChevronUp size={16} color={COLORS.text} />
            ) : (
              <ChevronDown size={16} color={COLORS.text} />
            )}
          </XStack>
        </XStack>

        {/* Question prompt */}

        <YStack px="$4" marginTop="$2">
          <XStack alignItems="center" gap="$2">
            <Users size={16} color={COLORS.text} />
            <Text fontWeight="bold">Question Prompt</Text>
          </XStack>

          <Text fontStyle="italic">"{round.questionPrompt}"</Text>
        </YStack>

        {/* Expanded view with pairs */}
        {isExpanded && (
          <YStack marginTop="$2" gap="$2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <XStack gap="$2" paddingVertical="$2">
                {round.pairs.map((pair, pairIndex) => (
                  <PairCard key={`pair-${pairIndex}`} pair={pair} />
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        )}
      </Card>
    );
  }
);
