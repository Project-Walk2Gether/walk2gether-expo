import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Walk } from "walk2gether-shared";
import WaitingRoomScreen from "../../../../../components/Walk/WaitingRoomScreen";
import { useDoc } from "../../../../../utils/firestore";

export default function WalkWaitingRoom() {
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  if (!walk) return null;
  return (
    <>
      <Stack.Screen
        options={{ title: "Waiting Room", animation: "slide_from_left" }}
      />
      <WaitingRoomScreen walk={walk} onBack={() => {}} />
    </>
  );
}
