import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { TouchableOpacity } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

interface Props {
  icon?: ReactNode;
  iconColor?: string;
  label?: string;
  labelColor?: string;
  title?: string;
  secondaryText?: string;
  onPress?: () => void;
  children?: ReactNode;
  action?: ReactNode;
  isLast?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  secondaryTextColor?: string;
}

const ActionRow: React.FC<Props> = ({
  icon,
  label,
  labelColor = COLORS.text,
  title,
  secondaryText,
  onPress,
  children,
  action,
  isLast = false,
  backgroundColor,
  titleColor = COLORS.text,
  secondaryTextColor = COLORS.textSecondary,
}) => {
  const content = (
    <YStack
      px="$4"
      py="$1.5"
      flexDirection="row"
      alignItems="center"
      minHeight={50}
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor={COLORS.border}
      backgroundColor={backgroundColor}
    >
      {icon && <View mr="$3">{React.isValidElement(icon) && icon}</View>}
      <View flex={1} justifyContent="center">
        {label && (
          <Text fontSize={16} fontWeight="500" color={labelColor}>
            {label}
          </Text>
        )}
        {title && secondaryText && (
          <XStack flex={1} justifyContent="space-between" alignItems="center">
            <YStack>
              <Text fontSize={12} fontWeight="bold" color={titleColor}>
                {title}
              </Text>
              <Text fontSize={16} color={secondaryTextColor}>
                {secondaryText}
              </Text>
            </YStack>
            {action && <View ml="$2">{action}</View>}
          </XStack>
        )}
        {!title && secondaryText && (
          <XStack flex={1} justifyContent="space-between" alignItems="center">
            <Text fontSize={16} color={secondaryTextColor}>
              {secondaryText}
            </Text>
            {action && <View ml="$2">{action}</View>}
          </XStack>
        )}
        {children}
      </View>
    </YStack>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

export default ActionRow;
