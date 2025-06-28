import { Stack } from "expo-router";
import React from "react";

export default function WalkStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen
        name="edit"
        options={{ title: "Edit Walk", presentation: "modal" }}
      />
      <Stack.Screen name="view-invitation" />
      <Stack.Screen
        name="show"
        options={{
          title: "Let's walk2gether!",
          presentation: "modal",
          animation: "none",
        }}
      />
      <Stack.Screen
        name="invite"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="gallery"
        options={{
          title: "Photo Gallery",
        }}
      />
    </Stack>
  );
}
