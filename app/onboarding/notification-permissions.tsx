import React from "react";
import { Button, Card, Text, YStack } from "tamagui";
import AuthScenicLayout from "../../components/Auth/AuthScenicLayout";
import { useRouter } from "expo-router";
import * as Notifications from 'expo-notifications';

export default function NotificationPermissionsScreen() {
  const router = useRouter();
  const [requesting, setRequesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRequest = async () => {
    setRequesting(true);
    setError(null);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        router.back();
      } else {
        setError('Permission not granted. You can enable notifications in your device settings.');
      }
    } catch (e: any) {
      setError('Error requesting permission: ' + e.message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <AuthScenicLayout showHouse scroll={false}>
      <YStack width="100%" ai="center" jc="center" gap="$4" p={24}>
        <Card elevate bordered width={360} maxWidth="100%" p={24} ai="center">
          <Text fontSize="$6" fontWeight="bold" mb="$2">Stay Connected!</Text>
          <Text fontSize="$4" mb="$4" textAlign="center">
            Enable notifications to get updates about walks, invitations, and important community news.
          </Text>
          <Button
            size="$4"
            backgroundColor="$blue9"
            color="white"
            width="100%"
            fontWeight="bold"
            fontSize={18}
            onPress={handleRequest}
            loading={requesting}
          >
            Enable Notifications
          </Button>
          {error && (
            <Text color="$red10" mt="$2" textAlign="center">{error}</Text>
          )}
        </Card>
      </YStack>
    </AuthScenicLayout>
  );
}
