import { COLORS } from "@/styles/colors";
import React from "react";
import { Card, Text, YStack } from "tamagui";

interface Props {
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number | string;
}

export function AuthCard({ title, children, maxWidth = 400 }: Props) {
  return (
    <Card
      elevation={5}
      bordered
      width="100%"
      maxWidth={maxWidth}
      padding="$4"
      marginVertical="$5"
      backgroundColor="white"
      borderRadius="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.25}
      shadowRadius={3.84}
      alignItems="center"
    >
      <YStack width="100%" gap="$4">
        {typeof title === "string" ? (
          <Text
            fontSize="$6"
            fontWeight="bold"
            color={COLORS.primary}
            textAlign="center"
          >
            {title}
          </Text>
        ) : (
          title
        )}
        {children}
      </YStack>
    </Card>
  );
}
