import { useAuth } from "context/AuthContext"";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Button, Card, Spinner, Text, XStack, YStack } from "tamagui";
import AuthScenicLayout from "../../../components/Auth/AuthScenicLayout";
import { useNotificationPermissions } from "../../../hooks/useNotificationPermissions";
import { COLORS } from "../../../styles/colors";
import { getAndSyncPushToken } from "../../../utils/getAndSyncPushToken";

const { height } = Dimensions.get("window");

export default function NotificationPermissionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { permissionStatus, requestPermissions } = useNotificationPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goToNext = () => router.push("/walks");

  useEffect(() => {
    // When permissions are granted, get the push token and call our API
    if (permissionStatus?.granted) {
      setIsLoading(true);
      getAndSyncPushToken()
        .then(goToNext)
        .catch((e) => setError(e.message))
        .finally(() => setIsLoading(false));
    }
  }, [permissionStatus]);

  return (
    <AuthScenicLayout showHouse scroll={false}>
      <YStack
        minHeight={height}
        width="100%"
        ai="center"
        jc="center"
        gap="$4"
        p={24}
      >
        <Card elevate bordered width={360} maxWidth="100%" p={24} ai="center">
          <Text fontSize="$6" fontWeight="bold" mb="$2">
            Stay Connected!
          </Text>
          <Text fontSize="$4" mb="$4" textAlign="center">
            Enable notifications to get updates about walks, invitations, and
            important community news.
          </Text>
          {error && (
            <Text color="$red10" mb="$2" textAlign="center">
              {error}
            </Text>
          )}
          <Button
            size="$4"
            backgroundColor={COLORS.primary}
            color="white"
            width="100%"
            fontWeight="bold"
            mt="$2"
            mb="$2"
            py="$2.5"
            onPress={requestPermissions}
            disabled={isLoading}
          >
            {isLoading ? (
              <XStack gap="$2" ai="center">
                <Spinner color="white" size="small" />
                <Text color="white" fontWeight="bold">
                  Setting up your account...
                </Text>
              </XStack>
            ) : (
              "Enable Notifications"
            )}
          </Button>
        </Card>

        <XStack justifyContent="flex-end" width="100%">
          <Button
            size="$3"
            variant="outlined"
            color={COLORS.primary}
            fontWeight="500"
            borderWidth={0}
            onPress={goToNext}
            disabled={isLoading}
            opacity={isLoading ? 0.5 : 1}
          >
            Skip for now
          </Button>
        </XStack>
      </YStack>
    </AuthScenicLayout>
  );
}
