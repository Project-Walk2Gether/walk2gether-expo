import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useNotifications } from "@/context/NotificationsContext";
import { COLORS } from "@/styles/colors";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Button, Card, Dialog, Spinner, Text, XStack, YStack } from "tamagui";

const { height } = Dimensions.get("window");

export default function NotificationPermissionsScreen() {
  const router = useRouter();
  const { permissionStatus, requestPermissions, loading, error } =
    useNotifications();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { showMessage } = useFlashMessage();

  const goToNext = () => router.push("/walks");

  useEffect(() => {
    // When permissions are granted, token is automatically synced via the context
    if (permissionStatus?.granted) {
      goToNext();
    }
  }, [permissionStatus]);

  return (
    <AuthScenicLayout scroll={false}>
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
            Let's enable notifications
          </Text>
          <Text fontSize="$4" mb="$4" textAlign="center">
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
          <Text color="$gray6" fontSize="$4" mb="$4" textAlign="center">
            Timely notifications help you make the most of your Walk2Gether
            experience.
          </Text>
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
                onPress={goToNext}
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
