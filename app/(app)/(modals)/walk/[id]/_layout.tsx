import { Stack } from "expo-router";
import React from "react";

export default function WalkStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="check-in" options={{ headerShown: true }} />
      <Stack.Screen name="waiting-room" options={{ headerShown: true }} />
    </Stack>
  );
}
