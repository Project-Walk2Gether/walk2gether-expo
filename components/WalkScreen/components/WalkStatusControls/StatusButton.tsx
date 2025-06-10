import React from "react";
import { Button, Text, XStack } from "tamagui";
import { StatusType } from "./utils/walkStatusUtils";

interface Props {
  backgroundColor: string;
  icon: React.ReactNode;
  statusText: string;
  children?: React.ReactNode;
  isOnTheWay?: boolean;
  onPress?: () => void;
}

/**
 * Button that displays the current status with appropriate styling
 */
export const StatusButton: React.FC<Props> = ({
  backgroundColor,
  icon,
  statusText,
  children,
  isOnTheWay = false,
  onPress,
}) => {
  return (
    <Button
      backgroundColor={backgroundColor}
      color="white"
      borderRadius={30}
      paddingHorizontal={15}
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
    >
      <XStack
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
      >
        {/* Absolutely positioned status icon on the left */}
        <XStack
          position="absolute"
          alignItems="center"
          left={0}
          justifyContent="center"
          zIndex={1}
        >
          {icon}
        </XStack>

        {/* Centered button text and status indicator */}
        <XStack
          flex={1}
          alignItems="center"
          justifyContent={isOnTheWay ? "flex-start" : "center"}
          ml={isOnTheWay ? "$5" : 0}
          width="100%"
        >
          <XStack alignItems="center" gap="$1">
            <Text textAlign="center" color="white" fontWeight="bold">
              {statusText}
            </Text>
          </XStack>
        </XStack>

        {/* Content for right side (typically navigation toggle) */}
        {children && (
          <XStack
            position="absolute"
            right="$2"
            alignItems="center"
            gap="$2"
            zIndex={1}
          >
            {children}
          </XStack>
        )}
      </XStack>
    </Button>
  );
};
