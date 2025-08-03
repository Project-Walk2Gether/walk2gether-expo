import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";
import { useAuth } from "../context/AuthContext";
import { useUpdates } from "../context/UpdatesContext";

interface Props {
  timeoutMs?: number;
}

export default function FullScreenLoader({ timeoutMs = 5000 }: Props) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { reloadApp } = useUpdates();
  const { signOut } = useAuth();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [timeoutMs]);

  const handleReload = () => {
    setHasTimedOut(false);
    reloadApp();
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="#fff"
      padding="$4"
    >
      {!hasTimedOut ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <YStack gap="$4" alignItems="center">
          <Text fontSize="$5" fontWeight="bold" textAlign="center">
            Taking longer than expected
          </Text>
          <Text textAlign="center" color="$gray11">
            The operation is taking longer than expected. You can try reloading
            the app or sign out.
          </Text>
          <XStack gap="$4" marginTop="$4">
            <Button onPress={handleReload} theme="active">
              Reload App
            </Button>
            <Button onPress={signOut} theme="gray">
              Sign Out
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
