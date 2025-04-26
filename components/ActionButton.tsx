import React from "react";
import { ActivityIndicator } from "react-native";
import { Button, Text } from "tamagui";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  iconAfter?: React.ReactNode;
  testID?: string;
}

export function ActionButton({
  onPress,
  disabled = false,
  loading = false,
  children,
  iconAfter,
  testID,
}: Props) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled || loading}
      width="100%"
      height={55}
      marginTop={10}
      backgroundColor="#4EB1BA"
      borderRadius={10}
      justifyContent="center"
      alignItems="center"
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
        <>
          <Text color="white" fontSize={20} fontWeight="bold">
            {children}
          </Text>
          {iconAfter}
        </>
      )}
    </Button>
  );
}
