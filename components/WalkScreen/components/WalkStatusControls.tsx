import { doc, setDoc } from "@react-native-firebase/firestore";
import { Car, Check, Footprints, MapPin } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, Spinner, Switch, Text, XStack, YStack } from "tamagui";
import Menu, { MenuItem } from "../../../components/Menu";
import { firestore_instance } from "../../../config/firebase";
import { COLORS } from "../../../styles/colors";
import SlideToStart from "./SlideToStart";

type WalkStatusControlsProps = {
  walkId: string;
  userId: string | undefined;
  initialStatus?: "pending" | "on-the-way" | "arrived";
  initialNavigationMethod?: "walking" | "driving";
  isOwner?: boolean;
  walkStarted?: boolean;
  onStatusChange?: (status: "pending" | "on-the-way" | "arrived") => void;
  onNavigationMethodChange?: (isDriving: boolean) => void;
  onStartWalk?: () => void;
};

/**
 * A component that combines the walk status toggle and navigation method selector
 */
export const WalkStatusControls: React.FC<WalkStatusControlsProps> = ({
  walkId,
  userId,
  initialStatus = "pending",
  initialNavigationMethod = "walking",
  isOwner = false,
  walkStarted = false,
  onStatusChange,
  onNavigationMethodChange,
  onStartWalk,
}) => {
  // Status state
  const [status, setStatus] = useState<"pending" | "on-the-way" | "arrived">(
    initialStatus
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Navigation method state
  const [isDriving, setIsDriving] = useState(
    initialNavigationMethod === "driving"
  );

  // Update local state when props change
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setIsDriving(initialNavigationMethod === "driving");
  }, [initialNavigationMethod]);

  // Handle status change
  const handleStatusChange = async (
    newStatus: "pending" | "on-the-way" | "arrived"
  ) => {
    if (!userId || !walkId) return;
    if (status === newStatus) return; // Don't update if status is the same

    setIsUpdatingStatus(true);
    try {
      // Update status in Firestore
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${userId}`
      );

      await setDoc(
        participantDocRef,
        {
          // Set the status field according to the schema
          status: newStatus,
          // Also update the timestamp when status changes
          statusUpdatedAt: new Date().getTime(),
          // Always ensure navigation method is set
          navigationMethod: isDriving ? "driving" : "walking",
        },
        { merge: true }
      );

      // If user is walk owner and changing from "arrived" to another status,
      // reset the walk's startedAt property
      if (
        isOwner &&
        status === "arrived" &&
        newStatus !== "arrived" &&
        walkStarted
      ) {
        const walkDocRef = doc(firestore_instance, `walks/${walkId}`);

        await setDoc(
          walkDocRef,
          {
            startedAt: null,
          },
          { merge: true }
        );

        console.log(
          "Walk startedAt reset because owner changed status from arrived"
        );
      }

      // Update local state
      setStatus(newStatus);

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
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

  // Get status button color based on the current status
  const getStatusButtonColor = () => {
    // Show a distinct color when the walk has started
    if (walkStarted && status === "arrived") {
      return "$purple9"; // Purple for walk started
    }

    switch (status) {
      case "on-the-way":
        return "$green9";
      case "arrived":
        return "$blue9";
      default:
        return COLORS.primary;
    }
  };

  // Get status button text based on the current status
  const getStatusButtonText = () => {
    // Show "Walk started" when the walk has started and user has arrived or is the owner
    if (walkStarted && status === "arrived") {
      return "Walk started";
    }

    switch (status) {
      case "on-the-way":
        return "On my way";
      case "arrived":
        // Don't show text when slider is active
        return showSlider ? "" : "I've arrived";
      default:
        return "I'm not on my way yet";
    }
  };

  // Get status button icon based on the current status
  const getStatusButtonIcon = () => {
    if (isUpdatingStatus) {
      return <Spinner color="white" size="small" />;
    }

    switch (status) {
      case "on-the-way":
        return <Check size={20} color="white" />;
      case "arrived":
        return <MapPin size={20} color="white" />;
      default:
        return null;
    }
  };

  // Create menu items for the status menu
  const statusMenuItems: MenuItem[] = [
    {
      label: "I'm not on my way yet",
      onPress: () => handleStatusChange("pending"),
      buttonProps: {
        backgroundColor: COLORS.primary,
        color: COLORS.textOnDark,
      },
    },
    {
      label: "I'm on my way",
      onPress: () => handleStatusChange("on-the-way"),
      buttonProps: {
        backgroundColor: "$green9",
      },
      icon: <Check size={16} color="white" />,
    },
    {
      label: "I've arrived",
      onPress: () => handleStatusChange("arrived"),
      buttonProps: {
        backgroundColor: "$blue9",
      },
      icon: <MapPin size={16} color="white" />,
    },
  ];

  // Create the menu trigger button
  const menuTrigger = (
    <Button
      backgroundColor={getStatusButtonColor()}
      color="white"
      borderRadius={30}
      paddingHorizontal={15}
      pressStyle={{ opacity: 0.8 }}
    >
      <XStack width="100%" alignItems="center" justifyContent="space-between">
        {/* Button text and status indicator */}
        <XStack flex={1} alignItems="center" gap="$1">
          {getStatusButtonIcon()}
          <XStack alignItems="center" gap="$1" flexGrow={1}>
            <Text
              textAlign={status === "on-the-way" ? "left" : "center"}
              color="white"
              fontWeight="bold"
              flexGrow={status !== "on-the-way" ? 1 : undefined}
            >
              {getStatusButtonText()}
            </Text>
            {status === "pending" && (
              <Text color="white" opacity={0.8} fontSize={12}>
                (change)
              </Text>
            )}
          </XStack>
        </XStack>

        {/* Mode toggle with icons on right side - only show when on the way */}
        {status === "on-the-way" && (
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
        )}
      </XStack>
    </Button>
  );

  // Handle walk start action
  const handleStartWalk = () => {
    if (onStartWalk) {
      onStartWalk();
    }
  };

  // Check if we should show the slider instead of regular button
  const showStartWalkSlider = isOwner && status === "arrived" && !walkStarted;

  // We'll show the regular button all the time, and overlay the slider when needed
  const showSlider = showStartWalkSlider;

  // Otherwise show the regular menu
  return (
    <YStack position="absolute" bottom={45} left={0} right={0} px="$4">
      <YStack position="relative">
        <Menu
          title="Update your status"
          items={statusMenuItems}
          trigger={menuTrigger}
          snapPoints={[35]}
        />

        {/* Slide To Start overlay */}
        {showSlider && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={10}
          >
            <SlideToStart onSlideComplete={handleStartWalk} />
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};

export default WalkStatusControls;
