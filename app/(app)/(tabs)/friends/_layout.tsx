import { Stack } from "expo-router";
import React from "react";

// Create a stack layout for chat system
export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Chats",
          headerShown: false,
          headerStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chat",
          headerShown: true,
          headerBackTitle: "Chats",
          headerStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: true,
        }}
      />
    </Stack>
  );
}
