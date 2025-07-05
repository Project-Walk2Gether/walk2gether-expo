import { Stack } from "expo-router";
import { Platform } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WalkStackLayout() {
  const content = (
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

  return Platform.OS === 'android' ? (
    <SafeAreaView style={{ flex: 1 }}>{content}</SafeAreaView>
  ) : (
    content
  );
}
