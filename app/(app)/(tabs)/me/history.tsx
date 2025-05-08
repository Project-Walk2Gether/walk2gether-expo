import { Screen } from "@/components/UI";
import WalkCardFromId from "@/components/WalkCard/FromId";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import firestore from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Card, Text, YStack } from "tamagui";
import { Participant } from "walk2gether-shared";

export default function WalkHistoryScreen() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Use the useQuery hook with a collectionGroup query to get all participant records
  const { docs: participantDocs, status } = useQuery<Participant>(
    user
      ? firestore()
          .collectionGroup("participants")
          .where("userUid", "==", user.uid)
          .where("approvedAt", "!=", null)
          .orderBy("approvedAt", "desc") // Sort by most recently approved first
      : undefined,
    [user?.uid]
  );

  // Extract walkIds from the participant documents
  const walkIds = participantDocs
    .map((participant) => {
      // The parent path will look like "walks/{walkId}/participants/{participantId}"
      const walkRef = participant._ref.parent.parent;
      return walkRef ? walkRef.id : null;
    })
    .filter((id): id is string => id !== null);

  // Create a renderItem function that uses WalkCardFromId
  const renderWalkItem = ({ item }: { item: string }) => (
    <WalkCardFromId walkId={item} />
  );

  if (status === "loading") {
    return (
      <Screen title="My Walk History">
        <YStack f={1} jc="center" ai="center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </YStack>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="My Walk History">
        <Card backgroundColor="$red2" p="$4" borderRadius={12}>
          <Text color="$red9">{error}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="My Walk History">
      {walkIds.length > 0 ? (
        <FlatList
          data={walkIds}
          renderItem={renderWalkItem}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Card backgroundColor="white" padding="$4" borderRadius={12}>
          <YStack alignItems="center" gap="$2">
            <Text fontSize={18} fontWeight="500" textAlign="center">
              You haven't participated in any walks yet
            </Text>
            <Text color="$gray9" textAlign="center">
              When you join or create walks, they'll appear here.
            </Text>
          </YStack>
        </Card>
      )}
    </Screen>
  );
}
