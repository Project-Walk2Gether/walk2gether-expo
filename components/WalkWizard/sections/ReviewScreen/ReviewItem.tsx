import { COLORS } from "@/styles/colors";
import React from "react";
import { Button, Text, XStack, YStack } from "tamagui";

interface Props {
  icon: React.ComponentType<{ size?: string; color?: string }>;
  title: string;
  content: React.ReactNode;
  onEdit: () => void;
}

export const ReviewItem: React.FC<Props> = ({
  icon,
  title,
  content,
  onEdit,
}) => {
  return (
    <XStack alignItems="center" gap="$2">
      {React.createElement(icon, { size: "$3", color: COLORS.primary })}

      {/* Content section with flex to take available space and ensure text wrapping */}
      <YStack flex={1} paddingRight="$2" flexShrink={1}>
        <Text fontSize={16} color="$gray11" fontWeight="600">
          {title}
        </Text>
        {typeof content === "string" ? (
          <Text fontSize={18} color="$gray12" numberOfLines={2}>
            {content}
          </Text>
        ) : (
          content
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
