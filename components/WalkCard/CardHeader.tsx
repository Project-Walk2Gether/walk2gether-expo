import React, { ReactNode } from "react";
import { Text, XStack } from "tamagui";

interface Props {
  /**
   * The icon or avatar component to display
   */
  icon: React.ReactElement;

  /**
   * Title text to display
   */
  title: string;

  /**
   * Optional action component (like a menu)
   */
  action?: ReactNode;
}

/**
 * A specialized header component for cards that displays an icon/avatar, title, and optional action
 */
export const CardHeader: React.FC<Props> = ({ icon, title, action }) => {
  return (
    <XStack
      mx={-7}
      alignItems="center"
      justifyContent="space-between"
      mb={12}
      mt={4}
    >
      <XStack alignItems="center" gap="$1.5" flex={1}>
        {icon}
        <Text
          fontSize={18}
          fontWeight="$6"
          color="$gray12"
          numberOfLines={1}
          ellipsizeMode="tail"
          flex={1}
        >
          {title}
        </Text>
      </XStack>
      {action}
    </XStack>
  );
};
