import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  testID?: string;
}

/**
 * A consistent row component for displaying information in walk detail cards
 */
export default function WalkDetailsRow({
  icon,
  label,
  sublabel,
  testID,
}: Props) {
  return (
    <XStack gap="$2" alignItems="flex-start" testID={testID}>
      {icon && (
        <YStack>
          {React.isValidElement(icon)
            ? React.cloneElement(icon, {
                size: 16,
                color: COLORS.primary,
              } as any)
            : icon}
        </YStack>
      )}

      <YStack gap="$1" flex={1}>
        <Text fontSize="$4" color="$gray12">
          {label}
        </Text>

        {sublabel && (
          <Text fontSize="$3" color="$gray11">
            {sublabel}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
