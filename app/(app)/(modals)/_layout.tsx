import { Stack } from "expo-router";
import React from "react";

export default function ModalsStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="profile/index"
        options={{ presentation: "modal", headerShown: true, title: "Profile" }}
      />
      <Stack.Screen
        name="qr-code"
        options={{ headerShown: true, title: "Your QR Code" }}
      />
    </Stack>
  );
}
