import { COLORS } from "@/styles/colors";
import { Check, MapPin } from "@tamagui/lucide-icons";
import React from "react";
import { Spinner } from "tamagui";
import { NavigationToggle } from "../../ParticipantStatusMenu/NavigationToggle";

export type StatusType = "pending" | "on-the-way" | "arrived";

/**
 * Get the appropriate button color based on status and walk state
 */
export const getStatusButtonColor = (
  status: StatusType,
  isCancelled: boolean,
  walkStarted: boolean
): string => {
  // If the participant has cancelled, show red
  if (isCancelled) {
    return "$red9";
  }

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

/**
 * Get the appropriate text to display on the status button
 */
export const getStatusText = (
  status: StatusType,
  walkStarted: boolean,
  walkEnded: boolean,
  isCancelled: boolean,
  showSlider: boolean = false,
  showEndWalkSlider: boolean = false
): string => {
  // Show a different message when the walk has ended
  if (walkEnded) {
    return "Walk completed";
  }

  // Show a different message when the participant has cancelled
  if (isCancelled) {
    return "Can't make it - Tap to change";
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
      return showSlider ? "" : "I've arrived!";
    default:
      return "Tell others I'm on my way";
  }
};

/**
 * Get the appropriate icon to display on the status button
 */
export const getStatusButtonIcon = (
  status: StatusType,
  walkEnded: boolean,
  isUpdatingStatus: boolean
): React.ReactNode => {
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

/**
 * Generate menu items for status selection
 */
export const getStatusMenuItems = (
  status: StatusType,
  isCancelled: boolean,
  isOwner: boolean,
  handleStatusChange: (status: StatusType) => void,
  handleCancelParticipation: () => void,
  handleReactivateParticipation: () => void
) => {
  if (isCancelled) {
    return [
      {
        label: "I can make it",
        onPress: handleReactivateParticipation,
        buttonProps: {
          backgroundColor: "$green9",
        },
        icon: <Check size={16} color="$green9" />,
      },
    ];
  } else {
    return [
      // Only show the cancel option for non-owners
      ...(isOwner
        ? []
        : [
            {
              label: "I can no longer make it",
              onPress: handleCancelParticipation,
              buttonProps: {
                backgroundColor: "$red9",
              },
            },
          ]),
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
        icon: <Check size={16} color="$green9" />,
        children: <NavigationToggle isDriving onToggle={() => {}} />,
      },
      {
        label: "Arrived",
        onPress: () => handleStatusChange("arrived"),
        buttonProps: {
          backgroundColor: "$blue9",
        },
        icon: <MapPin size={16} color="$blue9" />,
      },
    ];
  }
};
