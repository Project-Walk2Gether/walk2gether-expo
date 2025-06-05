import { firestore_instance } from "@/config/firebase";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { Locate, LocateOff } from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import React from "react";
import { Alert } from "react-native";
import { Button, Text, View, XStack } from "tamagui";

interface Props {
  userId: string;
}

/**
 * A toggle button for controlling background location tracking
 */
export default function BackgroundLocationTrackingToggle({ userId }: Props) {
  // Get location context to access permissions and methods
  const locationContext = useLocation();
  const backgroundLocationPermission =
    locationContext?.backgroundLocationPermission || false;

  // Toggle background location tracking and update user preference
  const handleToggleBackgroundTracking = async () => {
    if (!userId || !locationContext) return;

    try {
      if (backgroundLocationPermission) {
        // If it's currently enabled, we want to disable it
        // Guide users to system settings since we can't programmatically revoke permissions
        Alert.alert(
          "Disable Background Tracking",
          "To disable background location tracking, you'll need to go to your device settings and revoke location permissions for the app.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      } else {
        // Request background location permission
        const granted = await locationContext.requestBackgroundPermissions();

        // Update the timestamp when permissions were set
        if (granted && userId) {
          const userDocRef = doc(firestore_instance, `users/${userId}`);
          await setDoc(
            userDocRef,
            { locationPermissionsSetAt: Timestamp.now() },
            { merge: true }
          );
        }
      }
    } catch (error) {
      console.error("Error updating background tracking permission:", error);
    }
  };

  return (
    <View position="absolute" bottom={105} right={20}>
      <Button
        size="$4"
        borderRadius="$4"
        backgroundColor={backgroundLocationPermission ? COLORS.info : "$gray8"}
        onPress={handleToggleBackgroundTracking}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        paddingHorizontal={12}
        elevate
      >
        <XStack alignItems="center" space="$2">
          {backgroundLocationPermission ? (
            <Locate size={16} color="white" />
          ) : (
            <LocateOff size={16} color="$gray12" />
          )}
          <Text
            color={backgroundLocationPermission ? "white" : "$gray12"}
            fontSize={12}
            fontWeight="bold"
          >
            {backgroundLocationPermission
              ? "Location tracking On"
              : "Location tracking Off"}
          </Text>
        </XStack>
      </Button>
    </View>
  );
}
