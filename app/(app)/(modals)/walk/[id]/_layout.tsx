import { Stack } from "expo-router";
import React from "react";

export default function WalkStackLayout() {
  return (
    <>
      <Stack screenOptions={{ animation: "none" }}>
        <Stack.Screen name="index" options={{ headerShown: true }} />
        <Stack.Screen name="request" options={{ headerShown: true }} />
        <Stack.Screen name="show" options={{ headerShown: true }} />
        <Stack.Screen name="waiting-room" options={{ headerShown: true }} />
      </Stack>
    </>
  );
}
