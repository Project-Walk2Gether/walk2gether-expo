import React, { useEffect, useState } from "react";
import { YStack } from "tamagui";
import { useMenu } from "@/context/MenuContext";
import { NavigationToggle } from "./NavigationToggle";
import { StatusButton } from "./StatusButton";
import { WalkActionSliders } from "./WalkActionSliders";
import { useParticipantStatus } from "./hooks/useParticipantStatus";
import {
  StatusType,
  getStatusButtonColor,
  getStatusButtonIcon,
  getStatusMenuItems,
  getStatusText,
} from "./utils/walkStatusUtils";

interface Props {
  walkId: string;
  userId: string | undefined;
  initialStatus?: StatusType;
  initialNavigationMethod?: "walking" | "driving";
  isOwner?: boolean;
  walkStarted?: boolean;
  walkEnded?: boolean;
  isCancelled?: boolean;
  onStatusChange?: (status: StatusType) => void;
  onNavigationMethodChange?: (isDriving: boolean) => void;
  onStartWalk?: () => void;
  onEndWalk?: () => void;
}

/**
 * A component that combines the walk status toggle and navigation method selector
 */
const WalkStatusControls: React.FC<Props> = ({
  walkId,
  userId,
  initialStatus = "pending",
  initialNavigationMethod = "walking",
  isOwner = false,
  walkStarted = false,
  walkEnded = false,
  isCancelled = false,
  onStatusChange,
  onNavigationMethodChange,
  onStartWalk,
  onEndWalk,
}) => {
  // Status state
  const [status, setStatus] = useState<StatusType>(initialStatus);
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

  // Use our custom hook for Firebase operations
  const {
    updateStatus,
    updateNavigationMethod,
    cancelParticipation,
    reactivateParticipation,
  } = useParticipantStatus({
    walkId,
    userId,
    isOwner,
    walkStarted,
  });

  // Handle walk start action
  const handleStartWalk = () => {
    if (onStartWalk) onStartWalk();
  };

  // Handle walk end action
  const handleEndWalk = () => {
    if (onEndWalk) onEndWalk();
  };

  // Handle status change
  const handleStatusChange = async (newStatus: StatusType) => {
    if (status === newStatus) return; // Don't update if status is the same

    setIsUpdatingStatus(true);

    const success = await updateStatus(
      newStatus,
      status,
      isDriving ? "driving" : "walking"
    );

    if (success) {
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    }

    setIsUpdatingStatus(false);
  };

  // Handle navigation method change
  const handleNavigationMethodChange = async (value: boolean) => {
    const previousValue = isDriving;

    // Optimistically update UI
    setIsDriving(value);

    const success = await updateNavigationMethod(value ? "driving" : "walking");

    if (success) {
      if (onNavigationMethodChange) {
        onNavigationMethodChange(value);
      }
    } else {
      // Revert UI state if update fails
      setIsDriving(previousValue);
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

  // Get status items for the menu
  const statusMenuItems = getStatusMenuItems(
    status,
    isCancelled,
    isOwner,
    handleStatusChange,
    cancelParticipation,
    reactivateParticipation
  );

  // Create the status button with appropriate styling
  const statusButtonColor = getStatusButtonColor(
    status,
    isCancelled,
    walkStarted
  );
  const statusButtonText = getStatusText(
    status,
    walkStarted,
    walkEnded,
    isCancelled,
    showSlider,
    showEndWalkSlider
  );
  const statusButtonIcon = getStatusButtonIcon(
    status,
    walkEnded,
    isUpdatingStatus
  );

  // Get the showMenu function from our context
  const { showMenu } = useMenu();

  // Create the status button that will open the menu when clicked
  const statusButton = (
    <StatusButton
      backgroundColor={statusButtonColor}
      icon={statusButtonIcon}
      statusText={statusButtonText}
      isOnTheWay={status === "on-the-way"}
      onPress={() => showMenu("Update your status", statusMenuItems)}
    >
      {status === "on-the-way" && (
        <NavigationToggle
          isDriving={isDriving}
          onToggle={handleNavigationMethodChange}
        />
      )}
    </StatusButton>
  );

  return (
    <YStack
      zIndex={0}
      position="absolute"
      bottom={45}
      left={0}
      right={0}
      px="$4"
    >
      <YStack position="relative">
        {statusButton}

        {/* Slide Action overlay */}
        {showSlider && (
          <WalkActionSliders
            showStartWalkSlider={showStartWalkSlider}
            showEndWalkSlider={showEndWalkSlider}
            onStartWalk={handleStartWalk}
            onEndWalk={handleEndWalk}
          />
        )}
      </YStack>
    </YStack>
  );
};

export default WalkStatusControls;
