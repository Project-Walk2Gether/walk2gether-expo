import ActiveWalkScreen from "@/components/Walk/ActiveWalkScreen";
import WalkHistoryScreen from "@/components/Walk/WalkHistoryScreen";
import { useDoc } from "@/utils/firestore";
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
        <Text>Walk not found or you were not part of this walk.</Text>
      </View>
    );
  }

  if (walk.active)
    return (
      <>
        {walk.active ? <ActiveWalkScreen /> : <WalkHistoryScreen walk={walk} />}
      </>
    );
}
