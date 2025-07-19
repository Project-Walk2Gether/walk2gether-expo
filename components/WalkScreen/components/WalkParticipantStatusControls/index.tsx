import { COLORS } from "@/styles/colors";
import { Check, MapPin } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Button, Spinner, XStack, YStack } from "tamagui";
import { Participant } from "walk2gether-shared";
import { useParticipantStatus } from "../../../../hooks/useParticipantStatus";
import { NavigationToggle } from "../ParticipantStatusMenu/NavigationToggle";

interface Props {
  status: Participant["status"];
  isCancelled: boolean;
  isOwner: boolean;
  walkId: string;
  userId?: string;
  navigationMethod?: "driving" | "walking";
  onClose?: () => void;
}

export default function WalkParticipantStatusControls({
  status,
  isCancelled,
  isOwner,
  walkId,
  userId,
  navigationMethod = "driving",
  onClose,
}: Props) {
  const [selectedStatus, setSelectedStatus] =
    useState<Participant["status"]>(status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedNavigationMethod, setSelectedNavigationMethod] = useState<
    "driving" | "walking"
  >(navigationMethod);

  // Use the participant status hook directly
  const {
    updateStatus,
    updateNavigationMethod,
    cancelParticipation,
    reactivateParticipation,
  } = useParticipantStatus({
    walkId,
    userId,
    isOwner,
  });

  // Handle status selection
  const handleStatusSelect = (newStatus: Participant["status"]) => {
    setSelectedStatus(newStatus);
  };

  // Handle navigation method toggle
  const handleNavigationToggle = (isDriving: boolean) => {
    setSelectedNavigationMethod(isDriving ? "driving" : "walking");
  };

  // Handle save button press
  const handleSave = async () => {
    setIsUpdating(true);
    try {
      if (isCancelled) {
        // Reactivate participation
        const success = await reactivateParticipation();
        if (success && onClose) {
          onClose();
        }
      } else {
        let success = true;

        // Update status if changed
        if (selectedStatus !== status) {
          success = await updateStatus(
            selectedStatus,
            status,
            selectedNavigationMethod
          );
        }

        // Update navigation method if changed
        if (success && selectedNavigationMethod !== navigationMethod) {
          success = await updateNavigationMethod(selectedNavigationMethod);
        }

        if (success && onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel participation
  const handleCancel = async () => {
    setIsUpdating(true);
    try {
      const success = await cancelParticipation();
      if (success && onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error cancelling participation:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine if the save button should be enabled
  const isSaveEnabled =
    isCancelled ||
    selectedStatus !== status ||
    selectedNavigationMethod !== navigationMethod;

  return (
    <YStack gap="$4" padding="$2">
      {isCancelled ? (
        <Button
          size="$4"
          backgroundColor="$green9"
          color="white"
          onPress={() => handleStatusSelect("pending")}
          icon={<Check size={16} color="white" />}
          pressStyle={{ opacity: 0.8 }}
          opacity={1}
        >
          I can make it
        </Button>
      ) : (
        <>
          <Button
            size="$4"
            backgroundColor={
              selectedStatus === "pending" ? COLORS.primary : undefined
            }
            color={selectedStatus === "pending" ? COLORS.textOnDark : undefined}
            onPress={() => handleStatusSelect("pending")}
            pressStyle={{ opacity: 0.8 }}
            opacity={selectedStatus === "pending" ? 1 : 0.7}
          >
            Not on my way yet
          </Button>

          <XStack gap="$2" alignItems="center">
            <Button
              size="$4"
              backgroundColor={
                selectedStatus === "on-the-way" ? "$green9" : undefined
              }
              color={selectedStatus === "on-the-way" ? "white" : undefined}
              onPress={() => handleStatusSelect("on-the-way")}
              icon={
                <Check
                  size={16}
                  color={selectedStatus === "on-the-way" ? "white" : "$green9"}
                />
              }
              pressStyle={{ opacity: 0.8 }}
              opacity={selectedStatus === "on-the-way" ? 1 : 0.7}
              flex={1}
            >
              On my way!
            </Button>

            {selectedStatus === "on-the-way" && (
              <NavigationToggle
                isDriving={selectedNavigationMethod === "driving"}
                onToggle={(isDriving) => handleNavigationToggle(isDriving)}
              />
            )}
          </XStack>

          <Button
            size="$4"
            backgroundColor={
              selectedStatus === "arrived" ? "$blue9" : undefined
            }
            color={selectedStatus === "arrived" ? "white" : undefined}
            onPress={() => handleStatusSelect("arrived")}
            icon={
              <MapPin
                size={16}
                color={selectedStatus === "arrived" ? "white" : "$blue9"}
              />
            }
            pressStyle={{ opacity: 0.8 }}
            opacity={selectedStatus === "arrived" ? 1 : 0.7}
          >
            Arrived
          </Button>
        </>
      )}

      <Button
        size="$4"
        backgroundColor="$blue10"
        color="white"
        onPress={handleSave}
        disabled={!isSaveEnabled || isUpdating}
        opacity={isSaveEnabled && !isUpdating ? 1 : 0.5}
        marginTop="$2"
        icon={isUpdating ? <Spinner size="small" color="white" /> : undefined}
      >
        {isUpdating ? "Updating..." : "Update my status"}
      </Button>
    </YStack>
  );
}
