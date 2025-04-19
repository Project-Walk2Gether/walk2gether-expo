import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Walk } from "walk2gether-shared";
import RequestToJoinScreen from "../../../../../components/Walk/RequestToJoinScreen";
import { useDoc } from "../../../../../utils/firestore";

export default function WalkCheckIn() {
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);

  if (!walk) return null;

  return (
    <>
      <Stack.Screen options={{ title: "Request to Join walk" }} />
      <RequestToJoinScreen walk={walk} />
    </>
  );
}
