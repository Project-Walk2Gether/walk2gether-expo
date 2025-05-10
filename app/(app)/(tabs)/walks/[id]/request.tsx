import HeaderBackButton from "@/components/HeaderBackButton";
import RequestToJoinWalkScreen from "@/components/RequestToJoinWalkScreen";
import { useDoc } from "@/utils/firestore";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { WithId, Walk } from "walk2gether-shared";

export default function WalkRequestScreen() {
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);

  if (!walk) return null;

  return (
    <>
      <Stack.Screen
        options={{
          // Title is dynamically set in RequestToJoinWalkScreen
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <RequestToJoinWalkScreen walk={walk} />
    </>
  );
}
