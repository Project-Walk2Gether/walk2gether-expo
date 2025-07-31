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
        space="$4"
        backgroundColor={userPair.color}
      >
        {/* Large emoji with color background */}
        <View
          width={200}
          height={200}
          borderRadius={100}
          bg="white"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={100}>{userPair.emoji}</Text>
        </View>

        {/* Find names text */}
        <Text fontSize={28} fontWeight="bold" textAlign="center" marginTop="$6">
          Find {partnerNames.join(", ")}
        </Text>
        <Text fontSize={23}>Look for the same color and emoji</Text>

        {/* Question prompt if available */}
        {activeRound.questionPrompt && (
          <YStack alignItems="center" marginTop="$8">
            <Text
              fontSize={16}
              color="$gray11"
              textAlign="center"
              marginBottom="$2"
            >
              Discussion Topic:
            </Text>
            <Text fontSize={22} textAlign="center" fontWeight="500">
              {activeRound.questionPrompt}
            </Text>
          </YStack>
        )}
      </YStack>
    </View>
  );
}
