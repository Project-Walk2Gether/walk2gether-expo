import React from "react";
import { Text, XStack } from "tamagui";
import { Pair } from "walk2gether-shared";
import { useWalk } from "../../../context/WalkContext";
import { formatNamesInSentenceCase } from "../../../utils/participantFilters";

interface Props {
  pair: Pair;
  isActual?: boolean;
}

export const PairCard = ({ pair, isActual = false }: Props) => {
  // Get walk data from context
  const { walk } = useWalk();

  // Get participant information from the walk's participantsById
  const participantsInfo = pair.userUids
    .map((uid) => walk?.participantsById?.[uid])
    .filter(
      (participant): participant is NonNullable<typeof participant> =>
        participant !== null && participant !== undefined
    );

  return (
    <XStack
      backgroundColor={pair.color}
      padding="$2"
      borderRadius="$4"
      overflow="hidden"
      opacity={isActual ? 0.9 : 1}
      alignItems="center"
      gap="$2"
      width="100%"
    >
      {/* Emoji */}
      <Text color="white" textAlign="center" fontSize="$6">
        {pair.emoji}
      </Text>

      {/* Participant names */}
      {participantsInfo.length > 0 ? (
        <Text
          flexShrink={1}
          textAlign="center"
          fontSize="$2"
          color="white"
          fontWeight="bold"
        >
          {formatNamesInSentenceCase(
            participantsInfo.map((participant) => participant.displayName)
          )}
        </Text>
      ) : (
        <Text textAlign="center" color="white" fontWeight="bold">
          {pair.userUids.length} participants
        </Text>
      )}
    </XStack>
  );
};
