import { Stack } from "expo-router";
import React from "react";

export default function WalksLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="home"
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="[id]" />
      </Stack>
    </>
  );
}
