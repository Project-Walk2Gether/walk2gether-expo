import { COLORS } from "@/styles/colors";
import { useWalkForm } from "@/context/WalkFormContext";
import { AlertTriangle, Pencil } from "@tamagui/lucide-icons";
import React from "react";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  icon: React.ComponentType<{ size?: string; color?: string }>;
  title: string;
  content: React.ReactNode;
  stepKey: string;
  error?: string;
}

export const ReviewItem: React.FC<Props> = ({
  icon,
  title,
  content,
  stepKey,
  error,
}) => {
  const { goToStepByKey } = useWalkForm();
  return (
    <XStack alignItems="center" gap="$2">
      {React.createElement(icon, {
        size: "$2",
        color: error ? COLORS.error : COLORS.primary,
      })}

      {/* Content section with flex to take available space and ensure text wrapping */}
      <YStack flex={1} paddingRight="$2" flexShrink={1}>
        <XStack alignItems="center" gap="$1">
          <Text
            fontSize={16}
            color={error ? COLORS.error : "$gray11"}
            fontWeight="600"
          >
            {title}
          </Text>
          {error && <AlertTriangle size="$1" color={COLORS.error} />}
        </XStack>
        {typeof content === "string" ? (
          <Text fontSize={16} color="$gray12" numberOfLines={2}>
            {content}
          </Text>
        ) : (
          content
        )}
        {error && (
          <Text fontSize={14} color={COLORS.error} marginTop="$1">
            {error}
          </Text>
        )}
      </YStack>

      {/* Edit button with fixed width */}
      <Pencil size={14} onPress={() => goToStepByKey(stepKey)} />
    </XStack>
  );
};

export default ReviewItem;
