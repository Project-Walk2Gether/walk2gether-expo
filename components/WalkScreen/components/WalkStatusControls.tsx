import Menu, { MenuItem } from "@/components/Menu";
import { firestore_instance } from "@/config/firebase";
import { COLORS } from "@/styles/colors";
import { doc, setDoc } from "@react-native-firebase/firestore";
import { Car, Check, Footprints, MapPin } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, Spinner, Switch, Text, XStack, YStack } from "tamagui";
import SlideAction from "./SlideToStart";

type WalkStatusControlsProps = {
  walkId: string;
  userId: string | undefined;
  initialStatus?: "pending" | "on-the-way" | "arrived";
  initialNavigationMethod?: "walking" | "driving";
  isOwner?: boolean;
  walkStarted?: boolean;
  walkEnded?: boolean;
  onStatusChange?: (status: "pending" | "on-the-way" | "arrived") => void;
  onNavigationMethodChange?: (isDriving: boolean) => void;
  onStartWalk?: () => void;
  onEndWalk?: () => void;
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
  walkEnded = false,
  onStatusChange,
  onNavigationMethodChange,
  onStartWalk,
  onEndWalk,
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
    // If the walk has ended
    if (walkEnded && status === "arrived") {
      return "Walk ended";
    }

    // Show "Walk started" when the walk has started and user has arrived or is the owner
    if (walkStarted && !walkEnded && status === "arrived") {
      // Don't show text when end walk slider is active
      return showEndWalkSlider ? "" : "Walk started";
    }

    switch (status) {
      case "on-the-way":
        return "On my way";
      case "arrived":
        // Don't show text when start walk slider is active
        return showSlider ? "" : "I've arrived";
      default:
        return "Tell others I'm on my way";
    }
  };

  // Get status button icon based on the current status
  const getStatusButtonIcon = () => {
    if (isUpdatingStatus) {
      return <Spinner color="white" size="small" />;
    }

    // Show a checkmark when the walk has ended
    if (walkEnded) {
      return <Check size={20} color="white" />;
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
      label: "Not on my way yet",
      onPress: () => handleStatusChange("pending"),
      buttonProps: {
        backgroundColor: COLORS.primary,
        color: COLORS.textOnDark,
      },
    },
    {
      label: "On my way!",
      onPress: () => handleStatusChange("on-the-way"),
      buttonProps: {
        backgroundColor: "$green9",
      },
      icon: <Check size={16} color="white" />,
    },
    {
      label: "Arrived",
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
      <XStack
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
      >
        {/* Absolutely positioned status icon on the left */}
        <XStack
          position="absolute"
          alignItems="center"
          left={0}
          justifyContent="center"
          zIndex={1}
        >
          {getStatusButtonIcon()}
        </XStack>

        {/* Centered button text and status indicator */}
        <XStack
          flex={1}
          alignItems="center"
          justifyContent={status === "on-the-way" ? "flex-start" : "center"}
          ml={status === "on-the-way" ? "$5" : 0}
          width="100%"
        >
          <XStack alignItems="center" gap="$1">
            <Text textAlign="center" color="white" fontWeight="bold">
              {getStatusButtonText()}
            </Text>
          </XStack>
        </XStack>

        {/* Mode toggle with icons on right side - only show when on the way */}
        {status === "on-the-way" && (
          <XStack
            position="absolute"
            right="$2"
            alignItems="center"
            gap="$2"
            zIndex={1}
          >
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

  // Handle walk end action
  const handleEndWalk = () => {
    if (onEndWalk) {
      onEndWalk();
    }
  };

  // Check if we should show the slider instead of regular button
  const showStartWalkSlider =
    isOwner && status === "arrived" && !walkStarted && !walkEnded;

  // Check if we should show the end walk slider
  const showEndWalkSlider =
    isOwner && status === "arrived" && walkStarted && !walkEnded;

  // We'll show the regular button all the time, and overlay the slider when needed
  const showSlider = showStartWalkSlider || showEndWalkSlider;

  // Otherwise show the regular menu
  return (
    <YStack position="absolute" bottom={45} left={0} right={0} px="$4">
      <YStack position="relative">
        <Menu
          title="Update your status"
          items={statusMenuItems}
          trigger={menuTrigger}
          snapPoints={[45]}
        />

        {/* Slide Action overlay */}
        {showSlider && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={10}
          >
            {showStartWalkSlider && (
              <SlideAction
                onSlideComplete={handleStartWalk}
                text="SLIDE TO START WALK"
                backgroundColor="rgba(0,153,255,0.9)"
                iconColor="#0099ff"
                icon="play"
              />
            )}
            {showEndWalkSlider && (
              <SlideAction
                onSlideComplete={handleEndWalk}
                text="SLIDE TO END WALK"
                backgroundColor="rgba(255,59,48,0.9)"
                iconColor="#FF3B30"
                icon="stop"
              />
            )}
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};

export default WalkStatusControls;
