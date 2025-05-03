import { doc, setDoc } from "@react-native-firebase/firestore";
import { Car, Check, Footprints } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, Spinner, Switch, Text, View, XStack } from "tamagui";
import { firestore_instance } from "../../../config/firebase";
import { COLORS } from "../../../styles/colors";

type WalkStatusControlsProps = {
  walkId: string;
  userId: string | undefined;
  initialStatus?: "pending" | "on-the-way" | "arrived";
  initialNavigationMethod?: "walking" | "driving";
  onStatusChange?: (isOnMyWay: boolean) => void;
  onNavigationMethodChange?: (isDriving: boolean) => void;
};

/**
 * A component that combines the walk status toggle and navigation method selector
 */
export const WalkStatusControls: React.FC<WalkStatusControlsProps> = ({
  walkId,
  userId,
  initialStatus = "pending",
  initialNavigationMethod = "walking",
  onStatusChange,
  onNavigationMethodChange,
}) => {
  // Status state
  const [isOnMyWay, setIsOnMyWay] = useState(initialStatus === "on-the-way");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Navigation method state
  const [isDriving, setIsDriving] = useState(
    initialNavigationMethod === "driving"
  );

  // Update local state when props change
  useEffect(() => {
    setIsOnMyWay(initialStatus === "on-the-way");
  }, [initialStatus]);

  useEffect(() => {
    setIsDriving(initialNavigationMethod === "driving");
  }, [initialNavigationMethod]);

  // Handle the "I'm on my way" button press
  const handleOnMyWayPress = async () => {
    if (!userId || !walkId) return;

    setIsUpdatingStatus(true);
    try {
      // Toggle the status
      const newStatus = !isOnMyWay;

      // Update status in Firestore
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${userId}`
      );

      await setDoc(
        participantDocRef,
        {
          // Set the proper status field according to the schema
          status: newStatus ? "on-the-way" : "pending",
          // Also update the timestamp when status changes
          statusUpdatedAt: new Date().getTime(),
          // Always ensure navigation method is set
          navigationMethod: isDriving ? "driving" : "walking",
        },
        { merge: true }
      );

      // Update local state
      setIsOnMyWay(newStatus);

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error("Error updating 'on my way' status:", error);
      Alert.alert("Error", "Failed to update your status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle navigation method change
  const handleNavigationMethodChange = async (value: boolean) => {
    setIsDriving(value);

    // Don't update Firestore if user is not logged in or walk ID is not available
    if (!userId || !walkId) return;

    try {
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${userId}`
      );

      await setDoc(
        participantDocRef,
        {
          navigationMethod: value ? "driving" : "walking",
        },
        { merge: true }
      );

      // Notify parent component
      if (onNavigationMethodChange) {
        onNavigationMethodChange(value);
      }
    } catch (error) {
      console.error("Error updating navigation method:", error);
      Alert.alert("Error", "Failed to update navigation method.");
      // Revert UI state if update fails
      setIsDriving(!value);
    }
  };

  return (
    <View position="absolute" bottom={15} width="90%" alignSelf="center">
      {/* Combined button with travel mode and on-my-way status */}
      <Button
        backgroundColor={isOnMyWay ? "$green9" : COLORS.primary}
        color="white"
        borderRadius={30}
        paddingHorizontal={15}
        onPress={handleOnMyWayPress}
        disabled={isUpdatingStatus}
        pressStyle={{ opacity: 0.8 }}
      >
        {/* Button content */}
        <XStack width="100%" alignItems="center" justifyContent="space-between">
          {/* Button text and status indicator */}
          <XStack flex={1} alignItems="center" gap="$1">
            {isUpdatingStatus ? (
              <Spinner color="white" size="small" />
            ) : isOnMyWay ? (
              <Check size={20} color="white" />
            ) : null}
            <Text
              textAlign={isOnMyWay ? "left" : "center"}
              flexGrow={isOnMyWay ? undefined : 1}
              color="white"
              fontWeight="bold"
            >
              {isOnMyWay ? "On my way" : "Tell others I'm on my way"}
            </Text>
          </XStack>

          {/* Mode toggle with icons on right side */}
          {isOnMyWay ? (
            <XStack alignItems="center" gap="$2">
              {/* Walking section - clickable */}
              <Pressable onPress={() => handleNavigationMethodChange(false)}>
                <XStack
                  alignItems="center"
                  opacity={isDriving ? 0.6 : 1}
                  paddingVertical={4}
                  paddingHorizontal={4}
                >
                  <Footprints size={16} color="white" />
                  <Text color="white" fontSize={12} marginLeft={2}>
                    Walking
                  </Text>
                </XStack>
              </Pressable>

              {/* Toggle switch with hit slop */}
              <Switch
                size="$1"
                checked={isDriving}
                onCheckedChange={handleNavigationMethodChange}
                backgroundColor={isDriving ? "white" : "rgba(255,255,255,0.3)"}
                borderColor="white"
                hitSlop={10}
              >
                <Switch.Thumb
                  animation="quick"
                  backgroundColor={isDriving ? COLORS.primary : "white"}
                />
              </Switch>

              {/* Driving section - clickable */}
              <Pressable onPress={() => handleNavigationMethodChange(true)}>
                <XStack
                  alignItems="center"
                  opacity={!isDriving ? 0.6 : 1}
                  paddingVertical={4}
                  paddingHorizontal={4}
                >
                  <Text color="white" fontSize={12} marginRight={2}>
                    Driving
                  </Text>
                  <Car size={16} color="white" />
                </XStack>
              </Pressable>
            </XStack>
          ) : null}
        </XStack>
      </Button>
    </View>
  );
};

export default WalkStatusControls;
