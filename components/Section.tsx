import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { H3, Text, View, XStack, YStack } from "tamagui";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  action,
}) => {
  return (
    <YStack gap="$3" mb="$6">
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$1"
      >
        <YStack>
          <H3 color={COLORS.text} fontWeight="bold">
            {title}
          </H3>
          {subtitle && (
            <Text color={COLORS.textSecondary} fontSize="$3">
              {subtitle}
            </Text>
          )}
        </YStack>
        {action && <View marginLeft="$2">{action}</View>}
      </XStack>
      <View width="100%">{children}</View>
    </YStack>
  );
};

export default Section;
