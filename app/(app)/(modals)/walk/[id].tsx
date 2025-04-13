import ActiveWalkScreen from "@/components/Walk/ActiveWalkScreen";
import FutureWalkScreen from "@/components/Walk/FutureWalkScreen";
import WalkHistoryScreen from "@/components/Walk/WalkHistoryScreen";
import { useDoc } from "@/utils/firestore";
import { isActive, isFuture } from "@/utils/walkUtils";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Walk } from "walk2gether-shared";

export default function WalkDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);

  if (!walk) {
    return (
      <View>
        <Text>Walk not found, or you were not part of this walk.</Text>
      </View>
    );
  }

  console.log({ isActive: isActive(walk), isFuture: isFuture(walk) });

  // Use the utility functions to determine which screen to show
  if (isActive(walk)) {
    return <ActiveWalkScreen />;
  }

  if (isFuture(walk)) {
    return <FutureWalkScreen walk={walk} />;
  }

  // Default to history screen for past walks
  return <WalkHistoryScreen walk={walk} />;
}
