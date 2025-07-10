import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { MapPin } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Button, Dialog, H3, Text, View, XStack, YStack } from "tamagui";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestBackgroundLocationModal({
  open,
  onOpenChange,
}: Props) {
  const { user } = useAuth();
  const locationContext = useLocation();
  const [isRequesting, setIsRequesting] = useState(false);

  // Handle enabling background location tracking
  const handleEnableTracking = async () => {
    if (!locationContext) return;

    setIsRequesting(true);
    try {
      // Use the context wrapper to request background permissions
      // This ensures state is properly updated
      const granted = await locationContext.requestBackgroundPermissions();

      // Record the timestamp when permissions were set
      if (user?.uid) {
        const userDocRef = doc(firestore_instance, `users/${user.uid}`);
        await setDoc(
          userDocRef,
          {
            locationPermissionsSetAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error requesting background location permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle declining background location tracking
  const handleDecline = async () => {
    // Just record that the user made a decision about location permissions
    if (user?.uid) {
      const userDocRef = doc(firestore_instance, `users/${user.uid}`);
      await setDoc(
        userDocRef,
        {
          locationPermissionsSetAt: Timestamp.now(),
        },
        { merge: true }
      );
    }

    // Close the modal
    onOpenChange(false);
  };

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
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
          animateOnly={["transform", "opacity"]}
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: 20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          padding={0}
          mx="$4"
          borderRadius={24}
        >
          <YStack space={20} alignItems="center" padding={24}>
            {/* Icon */}
            <View
              backgroundColor={COLORS.primary}
              width={80}
              height={80}
              borderRadius={40}
              justifyContent="center"
              alignItems="center"
            >
              <MapPin size={40} color="white" />
            </View>

            {/* Title */}
            <H3 textAlign="center" fontSize={24}>
              Change to Always Allow
            </H3>

            {/* Description */}
            <Text textAlign="center" fontSize={16} color="$gray11">
              To keep others updated as you move, we need permission to track
              your location in the background.
            </Text>
            <Text textAlign="center" fontSize={16} color="$gray11">
              Tap "Change to Always Allow" to enable.
            </Text>

            {/* Bullet points */}
            <YStack space={8} width="100%">
              <XStack space={8} alignItems="center">
                <Text color={COLORS.primary}>🔹</Text>
                <Text fontSize={16} color="$gray11">
                  This is only active during walks.
                </Text>
              </XStack>
              <XStack space={8} alignItems="center">
                <Text color={COLORS.primary}>🔹</Text>
                <Text fontSize={16} color="$gray11">
                  You can disable it anytime.
                </Text>
              </XStack>
            </YStack>

            {/* Buttons */}
            <YStack space={12} width="100%" marginTop={12}>
              <Button
                backgroundColor={COLORS.primary}
                color="white"
                size="$5"
                onPress={handleEnableTracking}
                disabled={isRequesting}
              >
                Enable Tracking
              </Button>
              <Button
                backgroundColor="$gray3"
                color="$gray11"
                size="$5"
                onPress={handleDecline}
                disabled={isRequesting}
              >
                Not Now
              </Button>
            </YStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
