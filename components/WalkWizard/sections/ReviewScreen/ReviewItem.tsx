import { COLORS } from "@/styles/colors";
import React from "react";
import { AlertTriangle } from "@tamagui/lucide-icons";
import { Button, Text, XStack, YStack } from "tamagui";

interface Props {
  icon: React.ComponentType<{ size?: string; color?: string }>;
  title: string;
  content: React.ReactNode;
  onEdit: () => void;
  error?: string;
}

export const ReviewItem: React.FC<Props> = ({
  icon,
  title,
  content,
  onEdit,
  error,
}) => {
  return (
    <XStack alignItems="center" gap="$2">
      {React.createElement(icon, { size: "$3", color: error ? COLORS.error : COLORS.primary })}

      {/* Content section with flex to take available space and ensure text wrapping */}
      <YStack flex={1} paddingRight="$2" flexShrink={1}>
        <XStack alignItems="center" gap="$1">
          <Text fontSize={16} color={error ? COLORS.error : "$gray11"} fontWeight="600">
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
      <Button size="$2" variant="outlined" onPress={onEdit}>
        Edit
      </Button>
    </XStack>
  );
};

export default ReviewItem;
