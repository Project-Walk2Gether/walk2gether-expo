import { COLORS } from "@/styles/colors";
import { ReactNode } from "react";
import { Text, XStack, YStack } from "tamagui";

type ContentCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  description?: string;
  marginVertical?: number | string;
};

/**
 * A reusable semi-transparent card component with title, icon, and optional description
 */
export const ContentCard = ({
  title,
  icon,
  children,
  description,
}: ContentCardProps) => {
  return (
    <YStack
      gap="$2"
      backgroundColor="white"
      borderRadius="$4"
      padding="$5"
      shadowColor="#000"
      shadowOpacity={0.07}
      shadowRadius={7}
      shadowOffset={{ width: 0, height: 3 }}
    >
      <XStack
        alignItems="center"
        gap="$2"
        marginBottom={description ? "$1" : "$2"}
      >
        {icon}
        <Text fontSize={19} fontWeight="700" color={COLORS.textOnLight}>
          {title}
        </Text>
      </XStack>

      {description && (
        <Text fontSize={15} color="#6b7280" marginBottom="$2">
          {description}
        </Text>
      )}

      {children}
    </YStack>
  );
};
