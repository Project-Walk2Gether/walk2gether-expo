import { Stack } from "expo-router";
import React from "react";

export default function WalksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
