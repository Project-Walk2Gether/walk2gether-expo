import React from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

export default function FullScreenLoader() {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="#fff"
    >
      <ActivityIndicator size="large" color="#0000ff" />
    </YStack>
  );
}
