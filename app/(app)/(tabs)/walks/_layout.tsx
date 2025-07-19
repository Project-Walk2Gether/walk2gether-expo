import { Stack, usePathname } from "expo-router";
import React from "react";

export default function WalksLayout() {
  const pathname = usePathname();

  console.log("RENDERING");
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
