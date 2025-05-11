import { COLORS } from "@/styles/colors";
import { Stack } from "expo-router";
import React from "react";

export default function MeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textOnDark,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Profile", // This is used for the back button text
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "My Walk History",
          headerBackTitle: "Profile", // This sets the back button text
        }}
      />
    </Stack>
  );
}
