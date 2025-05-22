import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { YStack, Button, Text, XStack } from "tamagui";
import { useUpdates } from "../context/UpdatesContext";
import { useAuth } from "../context/AuthContext";

interface Props {
  timeoutMs?: number;
}

export default function FullScreenLoader({ timeoutMs = 15000 }: Props) {
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
        <YStack space="$4" alignItems="center">
          <Text fontSize="$5" fontWeight="bold" textAlign="center">
            Taking longer than expected
          </Text>
          <Text textAlign="center" color="$gray11">
            The operation is taking longer than expected. You can try reloading the app or sign out.
          </Text>
          <XStack space="$4" marginTop="$4">
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
