import { Screen } from "@/components/UI";
import WalkCardFromId from "@/components/WalkCard/FromId";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import firestore, { Timestamp } from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Card, Text, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";

export default function WalkHistoryScreen() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Query walks where user is invited and the walk has ended
  const { docs: pastWalks, status } = useQuery<Walk>(
    user
      ? firestore()
          .collection("walks")
          .where("invitedUserIds", "array-contains", user.uid)
          .where("estimatedEndTime", "<", Timestamp.now())
          .orderBy("estimatedEndTime", "desc") // Sort by most recently ended first
      : undefined,
    [user?.uid]
  );

  // Extract walkIds from the walk documents
  const walkIds = pastWalks.map((walk) => walk.id);

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
              You haven't participated in any past walks yet
            </Text>
            <Text color="$gray9" textAlign="center">
              When you join or create walks that end, they'll appear here.
            </Text>
          </YStack>
        </Card>
      )}
    </Screen>
  );
}
