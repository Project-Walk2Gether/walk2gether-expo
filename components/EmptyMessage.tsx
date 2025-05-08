import { COLORS } from "@/styles/colors";
import React from "react";
import { Text, XStack, YStack } from "tamagui";

interface EmptyMessageProps {
  message: string;
  subtitle?: string;
  icon?: React.ComponentType<{
    size?: number;
    color?: string;
    opacity?: number;
  }>;
  iconSize?: number;
  iconColor?: string;
}

export const EmptyMessage = ({
  message,
  subtitle,
  icon: Icon,
  iconSize = 60,
  iconColor = COLORS.primary,
}: EmptyMessageProps) => (
  <YStack
    padding={20}
    marginTop={10}
    paddingHorizontal={20}
    backgroundColor="rgba(255, 255, 255, 0.2)"
    borderRadius={12}
    ai="center"
    gap="$4"
  >
    {Icon && (
      <XStack ai="center" jc="center" mb="$2">
        <Icon size={iconSize} color={iconColor} opacity={0.9} />
      </XStack>
    )}
    <Text
      fontSize={18}
      fontWeight="600"
      color={COLORS.textOnLight}
      textAlign="center"
    >
      {message}
    </Text>
    {subtitle && (
      <Text
        fontSize={14}
        color={COLORS.textOnLight}
        opacity={0.8}
        textAlign="center"
      >
        {subtitle}
      </Text>
    )}
  </YStack>
);
