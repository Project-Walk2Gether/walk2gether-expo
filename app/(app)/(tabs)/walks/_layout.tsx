import { Stack } from "expo-router";
import React from "react";

export default function WalksLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
