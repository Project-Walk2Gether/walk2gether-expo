import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useNotificationPermissions } from "hooks/useNotificationPermissions";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { COLORS } from "styles/colors";
import { Button, Card, Spinner, Text, XStack, YStack } from "tamagui";
import AuthScenicLayout from "../../components/Auth/AuthScenicLayout";
import { callApi } from "../../utils/api";

const { height } = Dimensions.get("window");

export default function NotificationPermissionsScreen() {
  const router = useRouter();
  const { permissionStatus, checkPermissions, requestPermissions } =
    useNotificationPermissions();

  useEffect(() => {
    checkPermissions();
  }, []);

  const [isSettingClaim, setIsSettingClaim] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // When permissions are granted, get the push token and call our API
    const setPermissionsAndToken = async () => {
      if (permissionStatus?.granted && !isSettingClaim) {
        try {
          setIsSettingClaim(true);
          setError(null);

          // Get the Expo push token
          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;

          if (!Device.isDevice) {
            console.warn("Using simulator - push notifications won't work");
            // Call API without push token on simulator
            await callApi("user/set-permissions-claim");
          } else if (!projectId) {
            console.warn("Project ID not found - can't get push token");
            // Call API without push token
            await callApi("user/set-permissions-claim");
          } else {
            try {
              // Get the push token
              const token = await Notifications.getExpoPushTokenAsync({
                projectId,
              });

              console.log("Expo push token:", token.data);

              // Call our API endpoint with the push token
              await callApi("user/set-permissions-claim", {
                pushToken: token.data,
              });
            } catch (tokenError) {
              console.error("Error getting push token:", tokenError);
              // Call API without push token if we failed to get one
              await callApi("user/set-permissions-claim");
            }
          }

          // Navigate to home screen after setting the claim
          router.push("/walks/home/active");
        } catch (err) {
          console.error("Error setting permissions claim:", err);
          setError("Failed to update your account. Please try again.");
        } finally {
          setIsSettingClaim(false);
        }
      }
    };

    setPermissionsAndToken();
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
            mb="$1"
            py="$2.5"
            onPress={requestPermissions}
            disabled={isSettingClaim}
          >
            {isSettingClaim ? (
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
      </YStack>
    </AuthScenicLayout>
  );
}
