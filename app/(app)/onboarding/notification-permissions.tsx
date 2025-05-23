import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { Info } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Button, Card, Dialog, Spinner, Text, XStack, YStack } from "tamagui";

const { height } = Dimensions.get("window");

export default function NotificationPermissionsScreen() {
  const { goToNextScreen } = useOnboarding();
  const { user } = useAuth();
  const { permissionStatus, requestPermissions, loading, error } =
    useNotifications();
  const { updateDoc: updateUserData } = useDoc(
    user ? `users/${user.uid}` : undefined
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // When permissions are granted, mark as complete and continue
    if (permissionStatus?.granted) {
      completePermissionsSetup();
    }
  }, [permissionStatus]);

  // Mark permissions as completed and continue to next screen
  const completePermissionsSetup = async () => {
    if (!user) return;

    try {
      // Update the user data to mark this step as complete
      await updateUserData({
        notificationsPermissionsSetAt: serverTimestamp(),
      });
      // Then go to the next screen in the flow
      goToNextScreen();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <AuthScenicLayout scroll={false}>
      <YStack
        minHeight={height}
        width="100%"
        ai="center"
        jc="center"
        gap="$4"
        p="$4"
      >
        <Card elevate bordered width={360} maxWidth="100%" p={24} ai="center">
          <Text fontSize="$6" fontWeight="bold" mb="$2">
            Enable notifications
          </Text>
          <Text color="$color" fontSize="$4" mb="$4" textAlign="center">
            Timely notifications help you make the most of your Walk2Gether
            experience.
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
            mb="$2"
            onPress={requestPermissions}
            disabled={loading}
          >
            {loading ? (
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
          <XStack alignItems="center" mt="$2" gap="$2">
            <Info color="$gray12" />
            <Text color="$gray12" fontSize={12}>
              You can adjust notification settings later from the app
              preferences screen.
            </Text>
          </XStack>
        </Card>

        <XStack justifyContent="flex-end" width="100%">
          <Button
            size="$3"
            variant="outlined"
            color={COLORS.primary}
            fontWeight="500"
            borderWidth={0}
            onPress={() => setShowConfirmation(true)}
            disabled={loading}
            opacity={loading ? 0.5 : 1}
          >
            Skip for now
          </Button>
        </XStack>
      </YStack>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onOpenChange={(open) => {
          setShowConfirmation(open);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            paddingVertical="$4"
            paddingHorizontal="$4"
            mx="$4"
          >
            <Dialog.Title fontSize={18}>Skip Notifications?</Dialog.Title>
            <Dialog.Description size="$4" marginTop="$2" marginBottom="$4">
              Are you sure you want to skip notifications?
            </Dialog.Description>
            <YStack gap="$3">
              <Button
                backgroundColor={COLORS.primary}
                color="white"
                onPress={goToNextScreen}
                borderRadius="$4"
                padding="$2.5"
              >
                Yes, skip for now
              </Button>
              <Button
                borderColor={COLORS.subtle}
                color={COLORS.text}
                onPress={() => {
                  setShowConfirmation(false);
                  requestPermissions();
                }}
                variant="outlined"
                borderRadius="$4"
                padding="$2.5"
              >
                No, enable notifications
              </Button>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </AuthScenicLayout>
  );
}
