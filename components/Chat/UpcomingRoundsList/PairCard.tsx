import React from "react";
import { Text, XStack } from "tamagui";
import { Pair } from "walk2gether-shared";
import { useWalk } from "../../../context/WalkContext";

interface Props {
  pair: Pair;
  width: number;
}

interface UserInfo {
  displayName: string;
  photoURL?: string;
}

export const PairCard = ({ pair, width }: Props) => {
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
      flex={1}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Text color="white" textAlign="center" fontSize="$5" marginBottom="$1">
        {pair.emoji}
      </Text>

      {participantsInfo.length > 0 ? (
        participantsInfo.map((participant, index) => (
          <Text key={index} color="white" textAlign="center" fontSize="$2">
            {participant.displayName}
          </Text>
        ))
      ) : (
        <Text color="white" textAlign="center">
          {pair.userUids.length} participants
        </Text>
      )}
    </XStack>
  );
};
