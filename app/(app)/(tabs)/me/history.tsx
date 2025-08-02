import FullScreenLoader from "@/components/FullScreenLoader";
import { Screen } from "@/components/UI";
import WalkCard from "@/components/WalkCard";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/utils/firestore";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { Card, Text, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";

export default function WalkHistoryScreen() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Query walks where user is invited and the walk has ended.
  const { docs: pastWalks, status } = useQuery<Walk>(
    user
      ? firestore()
          .collection("walks")
          .where("participantUids", "array-contains", user.uid)
          .orderBy("estimatedEndTime", "desc") // Sort by most recently ended first
      : undefined,
    [user?.uid]
  );

  // Extract walkIds from the walk documents
  const walkIds = pastWalks.map((walk) => walk.id);

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <Screen>
        <Card backgroundColor="$red2" mx={20} p="$4" borderRadius={12}>
          <Text color="$red9">{error}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <YStack mx={20} pt="$4">
        {walkIds.length > 0 ? (
          <FlatList
            data={pastWalks}
            renderItem={({ item }) => (
              <WalkCard
                onPress={() => router.push(`/walks/${item.id}/plan`)}
                walk={item}
                canShowDismissButton={false}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <Card backgroundColor="white" padding="$4" borderRadius={12}>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={18} fontWeight="500" textAlign="center">
                You haven't participated in any walks yet
              </Text>
              <Text color="$gray9" textAlign="center">
                When you join or create walks that end, they'll appear here.
              </Text>
            </YStack>
          </Card>
        )}
      </YStack>
    </Screen>
  );
}
