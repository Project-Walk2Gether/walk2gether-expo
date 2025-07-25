import { useAuth } from "@/context/AuthContext";
import { useWalk } from "@/context/WalkContext";
import { useQuery } from "@/utils/firestore";
import {
  collection,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import React, { useMemo } from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";

interface Props {
  walkId: string;
}

export default function ActiveRoundIndicator({ walkId }: Props) {
  const { user } = useAuth();
  const { walk } = useWalk();
  const currentUserId = user?.uid;

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Query for active rounds (no endTime set)
  const roundsQuery = useMemo(() => {
    if (!walk?._ref) return undefined;
    // Convert DocumentReferenceLike to FirebaseFirestoreTypes.DocumentReference
    const walkRef = walk._ref as any;
    return query(
      collection(walkRef, "rounds"),
      where("endTime", "==", null),
      orderBy("startTime", "desc")
    );
  }, [walk?._ref]);

  const { docs: rounds } = useQuery(roundsQuery);
  const activeRound = rounds?.[0] as WithId<Round> | undefined;

  // Find the current user's pair in the active round
  const userPair = useMemo(() => {
    if (!activeRound || !currentUserId) return undefined;
    return activeRound.pairs.find((pair) =>
      pair.userUids.includes(currentUserId)
    );
  }, [activeRound, currentUserId]);

  // Get partner names (excluding current user)
  const partnerNames = useMemo(() => {
    if (!userPair || !walk?.participantsById || !currentUserId) return [];

    // Filter out current user and map to participant names
    return userPair.userUids
      .filter((uid) => uid !== currentUserId)
      .map((uid) => walk.participantsById[uid]?.displayName || "Unknown")
      .filter(Boolean);
  }, [userPair, currentUserId, walk?.participantsById]);

  // We don't need upcomingRounds or rotation handling here anymore
  // as this has been moved to the RoundsList component

  // If there's no active round, don't render anything
  if (!activeRound) return null;

  // If user isn't part of any pair in this round, show waiting message
  if (!userPair) {
    return (
      <Card
        borderRadius={0}
        backgroundColor="#f0f0f0"
        paddingVertical="$2"
        paddingHorizontal="$4"
      >
        <XStack justifyContent="center" alignItems="center">
          <Text fontSize={14} color="$gray10">
            Round in progress - wait for the next round
          </Text>
        </XStack>
        {/* Rotation timer has been moved to the RoundsList component */}
      </Card>
    );
  }

  // User is part of a pair, show their color and emoji
  return (
    <YStack>
      <Card
        borderRadius={0}
        backgroundColor={userPair.color}
        paddingVertical="$2"
        paddingHorizontal="$4"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={14} color="white" fontWeight="500">
              Round {activeRound.roundNumber}: Meet{" "}
              {partnerNames.length > 0
                ? partnerNames.join(", ")
                : "your partner"}
            </Text>
            {activeRound.questionPrompt && (
              <Text fontSize={12} color="white" opacity={0.9} marginTop="$1">
                Topic: {activeRound.questionPrompt}
              </Text>
            )}
          </YStack>
          <Text fontSize={24}>{userPair.emoji}</Text>
        </XStack>
      </Card>
      {/* Rotation timer has been moved to the RoundsList component */}
    </YStack>
  );
}
