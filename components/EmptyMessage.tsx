import { COLORS } from "styles/colors";
import { Text, YStack } from "tamagui";

export const EmptyMessage = ({
  message,
  subtitle,
}: {
  message: string;
  subtitle?: string;
}) => (
  <YStack
    padding={15}
    marginTop={10}
    paddingHorizontal={20}
    backgroundColor="rgba(255, 255, 255, 0.2)"
  >
    <Text
      fontSize={16}
      color={COLORS.textOnLight}
      marginBottom={10}
      borderRadius={10}
    >
      {message}
    </Text>
    {subtitle && (
      <Text fontSize={14} color={COLORS.textOnLight} opacity={0.8}>
        {subtitle}
      </Text>
    )}
  </YStack>
);
