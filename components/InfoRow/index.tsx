import React from "react";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  icon: React.ReactNode;
  title: string;
  content: string;
}

export function InfoRow({ icon, title, content }: Props) {
  return (
    <XStack
      backgroundColor="white"
      p="$4"
      borderRadius={12}
      gap="$3"
      alignItems="center"
    >
      {icon}
      <YStack flex={1}>
        <Text fontWeight="bold" fontSize={16} mb="$1">
          {title}
        </Text>
        <Text fontSize={14} opacity={0.9}>
          {content}
        </Text>
      </YStack>
    </XStack>
  );
}
