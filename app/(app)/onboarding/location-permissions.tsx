import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { MapPin } from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";
import { Button, Card, H1, Paragraph, XStack, YStack } from "tamagui";

const { height } = Dimensions.get("window");

const LocationPermissionsScreen = () => {
  const { goToNextScreen } = useOnboarding();
  const { locationPermission } = useLocation();
  const { user } = useAuth();
  const { doc: userData, updateDoc: updateUserData } = useDoc(
    user ? `users/${user.uid}` : undefined
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(
    locationPermission
  );

  // Update state when permissions change
  useEffect(() => {
    setPermissionStatus(locationPermission);
  }, [locationPermission]);

  // Redirect to next screen if permissions are already granted
  useEffect(() => {
    if (locationPermission) {
      completePermissionsSetup();
    }
  }, [locationPermission]);

  // Mark permissions as completed and continue to next screen
  const completePermissionsSetup = async () => {
    if (!user) return;

    try {
      // Update the user data to mark this step as complete
      await updateUserData({
        locationPermissionsSetAt: serverTimestamp(),
      });
      // Then go to the next screen in the flow
      goToNextScreen();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Request only foreground location permissions
  const requestForegroundPermission = async () => {
    setIsProcessing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status === "granted");

      // Mark as completed if permission is granted
      if (status === "granted") {
        await completePermissionsSetup();
      }
    } catch (error) {
      console.error("Error requesting foreground permission:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Open settings if user denied permissions
  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  return (
    <AuthScenicLayout scroll showSun showTree>
      <YStack
        minHeight={height}
        width="100%"
        ai="center"
        jc="center"
        gap="$4"
        p={24}
      >
        <Card elevate bordered width={360} maxWidth="100%" p={24} ai="center">
          <MapPin size={40} color={COLORS.primary} marginBottom="$2" />

          <H1 textAlign="center" fontSize={24}>
            Location permissions
          </H1>

          <Paragraph textAlign="center" marginTop="$2" marginBottom="$4">
            We use your location to notify you of walks near you and to show
            your location to friends during walks.
          </Paragraph>

          <Button
            backgroundColor={COLORS.primary}
            color="white"
            size="$4"
            width="100%"
            disabled={isProcessing}
            onPress={requestForegroundPermission}
          >
            {isProcessing ? "Processing..." : "Enable Location"}
          </Button>
        </Card>

        <XStack justifyContent="flex-end" width="100%">
          <Button
            size="$3"
            variant="outlined"
            color={COLORS.primary}
            fontWeight="500"
            borderWidth={0}
            onPress={completePermissionsSetup}
            disabled={isProcessing}
            opacity={isProcessing ? 0.5 : 1}
          >
            Skip for now
          </Button>
        </XStack>
      </YStack>
    </AuthScenicLayout>
  );
};

export default LocationPermissionsScreen;
