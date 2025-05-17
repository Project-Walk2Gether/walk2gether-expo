import { useNotifications } from "@/context/NotificationsContext";
import React from "react";
import { Button, Card, Text, View, YStack } from "tamagui";

export default function NotificationPermissionCard() {
  const { requestPermissions } = useNotifications();
  return (
    <View width="100%" marginBottom="$5">
      <Card
        backgroundColor="white"
        borderRadius="$5"
        padding="$5"
        width="100%"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        elevation={5}
      >
        <YStack space="$4">
          <Text fontSize="$4" lineHeight="$5" color="$gray10">
            Want to get notified of new walks in your area? Enable
            notifications.
          </Text>

          <Button
            backgroundColor="#4EB1BA"
            paddingVertical="$3"
            paddingHorizontal="$5"
            borderRadius="$3"
            alignSelf="flex-start"
            onPress={requestPermissions}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">
              Enable Notifications
            </Text>
          </Button>

          <Text fontSize="$3" color="$gray8" marginTop="$2">
            You can turn this off at any time.
          </Text>
        </YStack>
      </Card>
    </View>
  );
}
