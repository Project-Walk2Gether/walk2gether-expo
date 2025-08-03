import React from "react";
import { ActivityIndicator } from "react-native";
import { Button, ButtonProps, ColorProp, Text, XStack } from "tamagui";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  testID?: string;
  color?: ColorProp;
  theme?: ButtonProps["theme"];
}

export function ActionButton({
  onPress,
  disabled = false,
  loading = false,
  label,
  icon,
  iconAfter,
  testID,
  color = "white",
  ...rest
}: Props) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled || loading}
      height={55}
      backgroundColor={rest.theme ? undefined : "#4EB1BA"}
      borderRadius={10}
      justifyContent="center"
      alignItems="center"
      {...rest}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        opacity: disabled || loading ? 0.5 : 1,
        flexDirection: "row",
        gap: 8,
      }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <XStack alignItems="center" gap="$2">
          {icon}
          <Text fontSize={20} color={color} fontWeight="bold">
            {label}
          </Text>
          {iconAfter}
        </XStack>
      )}
    </Button>
  );
}
