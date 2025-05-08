import { Stack } from "expo-router";
import React from "react";

export default function WalkStackLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          animation: "none",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="edit" options={{ title: "Edit Walk" }} />
        <Stack.Screen name="request" />
        <Stack.Screen
          name="show"
          options={{
            title: "Let's walk2gether!",
          }}
        />
        <Stack.Screen
          name="gallery"
          options={{
            title: "Photo Gallery",
          }}
        />
      </Stack>
    </>
  );
}
