import React from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import { COLORS } from "@/styles/colors";

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
      {/* Icon component rendered with specified size */}
      {React.createElement(icon, { size: "$3.5", color: COLORS.primary })}
      
      {/* Content section */}
      <YStack>
        <Text fontSize={16} color="$gray11" fontWeight="600">
          {title}
        </Text>
        {typeof content === "string" ? (
          <Text fontSize={18} color="$gray12">
            {content}
          </Text>
        ) : (
          content
        )}
      </YStack>
      
      {/* Edit button */}
      <Button
        size="$2"
        variant="outlined"
        marginLeft="auto"
        onPress={onEdit}
      >
        Edit
      </Button>
    </XStack>
  );
};

export default ReviewItem;
