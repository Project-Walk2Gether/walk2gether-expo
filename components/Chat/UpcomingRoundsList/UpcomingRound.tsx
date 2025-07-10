import {
  ChevronDown,
  ChevronUp,
  Edit3 as Edit,
  Users,
} from "@tamagui/lucide-icons";
import React, { memo } from "react";
import { Dimensions } from "react-native";
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
    const screenWidth = Dimensions.get("window").width;

    return (
      <Card
        key={`upcoming-round-${index}`}
        backgroundColor="$blue1"
        padding="$4"
        marginBottom="$3"
        borderRadius="$4"
        onPress={onToggleExpand}
        pressStyle={{ opacity: 0.9 }}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">Round {round.roundNumber}</Text>

          <XStack space="$2">
            <Button
              size="$2"
              backgroundColor="transparent"
              icon={<Edit size={16} color={COLORS.primary} />}
              onPress={(e) => {
                e.stopPropagation();
                onEditPrompt();
              }}
            />
            {isExpanded ? (
              <ChevronUp size={16} color={COLORS.text} />
            ) : (
              <ChevronDown size={16} color={COLORS.text} />
            )}
          </XStack>
        </XStack>

        {/* Question prompt */}
        {round.questionPrompt && (
          <YStack marginTop="$2">
            <Text fontStyle="italic">"{round.questionPrompt}"</Text>
          </YStack>
        )}

        {/* Expanded view with pairs */}
        {isExpanded && (
          <YStack marginTop="$4" space="$2">
            <XStack alignItems="center" space="$2">
              <Users size={16} color={COLORS.text} />
              <Text fontWeight="bold">Pairs</Text>
            </XStack>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack space="$2" paddingVertical="$2">
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
