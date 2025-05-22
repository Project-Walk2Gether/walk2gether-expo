import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, YStack } from "tamagui";

interface Props {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export function NotFoundState({
  title = "Not Found",
  message = "The requested resource was not found",
  buttonText = "Go Back",
  onButtonPress,
}: Props) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      router.back();
    }
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$4"
    >
      <Text fontSize="$5" fontWeight="bold" textAlign="center" color="#666">
        {title}
      </Text>
      <Text fontSize="$3" textAlign="center" color="#666" marginTop="$2">
        {message}
      </Text>
      <Button
        marginTop="$6"
        onPress={handlePress}
        backgroundColor="#4EB1BA"
        color="white"
      >
        {buttonText}
      </Button>
    </YStack>
  );
}
