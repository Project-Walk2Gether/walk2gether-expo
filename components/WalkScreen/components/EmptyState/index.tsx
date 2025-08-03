import React from "react";
import { Text, YStack, Button } from "tamagui";

interface Props {
  message: string;
  actionText?: string;
  onActionPress?: () => void;
}

export default function EmptyState({ message, actionText, onActionPress }: Props) {
  return (
    <YStack alignItems="center" gap="$3" py="$4">
      <Text color="$gray10" textAlign="center">
        {message}
      </Text>
      {actionText && onActionPress && (
        <Button variant="outlined" onPress={onActionPress}>
          {actionText}
        </Button>
      )}
    </YStack>
  );
}
