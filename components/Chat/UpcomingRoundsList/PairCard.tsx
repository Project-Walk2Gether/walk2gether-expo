import React from "react";
import { Text, YStack } from "tamagui";
import { Pair } from "walk2gether-shared";
import { useWalk } from "../../../context/WalkContext";
import { formatNamesInSentenceCase } from "../../../utils/participantFilters";

interface Props {
  pair: Pair;
}

export const PairCard = ({ pair }: Props) => {
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
    <YStack
      borderBottomLeftRadius="$4"
      borderBottomRightRadius="$4"
      borderColor={"#888"}
      borderWidth={1}
      borderRadius="$4"
      overflow="hidden"
      flex={1}
    >
      {/* Colored top section */}
      <YStack
        backgroundColor={pair.color}
        padding="$2"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white" textAlign="center" fontSize="$5" marginBottom="$1">
          {pair.emoji}
        </Text>
      </YStack>

      {/* White bottom section */}
      <YStack
        backgroundColor="white"
        padding="$2"
        flex={1}
        alignItems="center"
        justifyContent="center"
      >
        {participantsInfo.length > 0 ? (
          <Text textAlign="center" fontSize="$2">
            {formatNamesInSentenceCase(
              participantsInfo.map((participant) => participant.displayName)
            )}
          </Text>
        ) : (
          <Text textAlign="center">{pair.userUids.length} participants</Text>
        )}
      </YStack>
    </YStack>
  );
};
