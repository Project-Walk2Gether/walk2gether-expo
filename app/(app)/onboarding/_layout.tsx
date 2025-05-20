import { COLORS } from "@/styles/colors";
import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="complete-your-profile"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
