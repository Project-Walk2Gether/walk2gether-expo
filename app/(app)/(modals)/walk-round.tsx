import { useAuth } from "@/context/AuthContext";
import { useDoc, useQuery } from "@/utils/firestore";
import { collection, orderBy, query } from "@react-native-firebase/firestore";
import { X } from "@tamagui/lucide-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Button, Text, View, YStack } from "tamagui";
import { Round, Walk, WithId } from "walk2gether-shared";

export default function WalkRoundModal() {
  const params = useLocalSearchParams<{ walkId: string }>();
  const walkId = (
    Array.isArray(params.walkId) ? params.walkId[0] : params.walkId
  ) as string;
  const { user } = useAuth();
  const currentUserId = user?.uid;

  // Get the walk document to access participants
  const { doc: walk } = useDoc<Walk>(`walks/${walkId}`);

  // Query for active rounds
  const roundsQuery = useMemo(() => {
    if (!walkId) return undefined;
    return query(
      collection(
        require("@react-native-firebase/firestore").default(),
        `walks/${walkId}/rounds`
      ),
      orderBy("startTime", "desc")
    );
  }, [walkId]);

  const { docs: rounds } = useQuery(roundsQuery);
  const activeRound = rounds?.[0] as WithId<Round> | undefined;

  // Find the current user's pair in the active round
  const userPair = useMemo(() => {
    if (!activeRound || !currentUserId) return undefined;
    return activeRound.pairs.find((pair) =>
      pair.userUids.includes(currentUserId)
    );
  }, [activeRound, currentUserId]);

  const handleClose = () => {
    router.back();
  };

  if (!activeRound || !userPair || !walk) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>No active round found.</Text>
        <Button onPress={handleClose} marginTop="$4">
          Close
        </Button>
      </YStack>
    );
  }

  // Get partners from pairs
  const partnerIds = userPair.userUids.filter((uid) => uid !== currentUserId);
  const partnerNames = walk.participantsById
    ? partnerIds.map(
        (id) => walk.participantsById?.[id]?.displayName || "Unknown"
      )
    : ["your partner"];

  return (
    <View flex={1}>
      <Stack.Screen
        options={{
          title: `Round ${activeRound.roundNumber}`,
          headerRight: () => (
            <Button
              size="$2"
              circular
              icon={<X size={18} />}
              onPress={handleClose}
              backgroundColor="transparent"
            />
          ),
        }}
      />

      <YStack
        flex={1}
        padding="$4"
        alignItems="center"
        justifyContent="center"
        gap="$6"
        backgroundColor={userPair.color}
      >
        {/* Large emoji display */}
        <YStack alignItems="center" gap="$4">
          <Text fontSize={120}>{userPair.emoji}</Text>
        </YStack>

        {/* Partner information in prominent box */}
        <YStack alignItems="center" gap="$4">
          <YStack
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$4"
            paddingHorizontal="$6"
            paddingVertical="$4"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.3)"
            gap="$3"
            alignItems="center"
          >
            <Text
              fontSize="$3"
              fontWeight="600"
              color="white"
              opacity={0.8}
              textAlign="center"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              You're paired with
            </Text>
            <Text
              fontSize="$7"
              fontWeight="700"
              color="white"
              textAlign="center"
            >
              {partnerNames.join(" & ")}
            </Text>
            <Text fontSize="$4" color="white" opacity={0.9} textAlign="center">
              Look for the same color and emoji to connect!
            </Text>
          </YStack>
        </YStack>

        {/* Discussion prompt section */}
        {activeRound.questionPrompt && (
          <YStack
            alignItems="center"
            gap="$3"
            paddingHorizontal="$4"
            maxWidth="90%"
          >
            <Text
              fontSize="$3"
              fontWeight="600"
              color="white"
              opacity={0.8}
              textTransform="uppercase"
              letterSpacing={0.8}
              textAlign="center"
            >
              Discussion Prompt
            </Text>
            <Text
              fontSize="$5"
              color="white"
              textAlign="center"
              fontWeight="500"
              lineHeight={28}
            >
              {activeRound.questionPrompt}
            </Text>
          </YStack>
        )}
      </YStack>
    </View>
  );
}
