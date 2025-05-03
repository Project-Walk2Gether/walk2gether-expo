import { Stack } from "expo-router";
import React from "react";

export default function WalkStackLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          animation: "none",
          presentation: "modal",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: true }} />
        <Stack.Screen name="edit" options={{ title: "Edit Walk" }} />
        <Stack.Screen name="request" options={{ headerShown: true }} />
        <Stack.Screen
          name="show"
          options={{
            title: "Let's walk2gether!",
          }}
        />
      </Stack>
    </>
  );
}
