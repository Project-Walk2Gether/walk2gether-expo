import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useWalk } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { ChevronRight } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Text, XStack } from "tamagui";
import { useParticipantStatus } from "../../../hooks/useParticipantStatus";
import WalkParticipantStatusControls from "./WalkParticipantStatusControls/index";

interface Props {
  /** Optional style overrides for the button */
  style?: any;
  /** Optional class to apply to the button */
  className?: string;
  /** Test ID for testing */
  testID?: string;
  /** Whether to show in a compact mode (smaller size) */
  compact?: boolean;
  /** Function to call after status is updated */
  onStatusUpdated?: () => void;
}

export default function StatusUpdateButton({
  style,
  className,
  testID = "status-update-button",
  onStatusUpdated,
}: Props) {
  const { user } = useAuth();
  const { walk } = useWalk();
  const { showSheet, hideSheet } = useSheet();

  // Use the participant status hook with walk object to access current status
  const { currentStatus, updateStatus } = useParticipantStatus({
    walkId: walk?.id || "",
    userId: user?.uid,
    isOwner: walk?.createdByUid === user?.uid,
    walk: walk || undefined,
  });

  // Only render the button if we have user, walk, and status data
  if (!user || !walk || !currentStatus) {
    return null;
  }

  // Customize button appearance based on current status
  const isPending = currentStatus.status === "pending";
  const isOnTheWay = currentStatus.status === "on-the-way";
  const hasArrived = currentStatus.status === "arrived";
  const isCancelled = currentStatus.isCancelled;

  // Determine button text based on status
  let buttonText = "Update Status";
  let buttonVariant = "subtle";
  let buttonColor = COLORS.primary;

  if (isPending) {
    buttonText = "Tell others I'm on my way";
    buttonVariant = "filled";
  } else if (isOnTheWay) {
    buttonText = "I'm on my way";
    buttonColor = COLORS.secondary;
  } else if (hasArrived) {
    buttonText = "I've arrived";
    buttonColor = COLORS.success;
  }

  const handleOpenStatusSheet = () => {
    if (!walk || !user || !currentStatus) return;

    showSheet(
      <WalkParticipantStatusControls
        status={currentStatus.status}
        isCancelled={isCancelled || false}
        isOwner={walk.createdByUid === user.uid}
        walkId={walk.id}
        userId={user.uid}
        navigationMethod={currentStatus.navigationMethod || "driving"}
        onClose={() => {
          hideSheet();
          if (onStatusUpdated) {
            onStatusUpdated();
          }
        }}
      />,
      {
        title: "Update Your Status",
        dismissOnSnapToBottom: true,
      }
    );
  };

  return (
    <>
      <Button
        onPress={handleOpenStatusSheet}
        backgroundColor={buttonVariant === "filled" ? buttonColor : undefined}
        borderColor={buttonVariant === "subtle" ? buttonColor : undefined}
        borderWidth={buttonVariant === "subtle" ? 1 : undefined}
        paddingVertical={"$3"}
        paddingHorizontal={"$4"}
        borderRadius="$6"
        style={style}
        className={className}
        testID={testID}
      >
        <XStack alignItems="center" justifyContent="space-between" width="100%">
          <Text
            color={buttonVariant === "filled" ? "white" : buttonColor}
            fontWeight="bold"
            fontSize={"$4"}
          >
            {buttonText}
          </Text>
          <ChevronRight
            size={20}
            color={buttonVariant === "filled" ? "white" : buttonColor}
          />
        </XStack>
      </Button>
    </>
  );
}
