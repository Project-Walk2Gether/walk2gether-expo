import { COLORS } from "@/styles/colors";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useImperativeHandle } from "react";
import { Avatar, Button, Text, XStack, YStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";

export interface ParticipantApprovalDrawerRef {
  openDrawer: (participant: ParticipantWithRoute) => void;
  closeDrawer: () => void;
}

interface ParticipantApprovalDrawerProps {
  onApprove: (participantId: string) => Promise<void>;
  onReject: (participantId: string) => Promise<void>;
}

const ParticipantApprovalDrawer = forwardRef<
  ParticipantApprovalDrawerRef,
  ParticipantApprovalDrawerProps
>(({ onApprove, onReject }, ref) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [selectedParticipant, setSelectedParticipant] =
    React.useState<ParticipantWithRoute | null>(null);

  // Snap points for the bottom sheet
  const snapPoints = React.useMemo(() => ["25%"], []);

  // Handle opening and closing the drawer
  const openDrawer = useCallback((participant: ParticipantWithRoute) => {
    setSelectedParticipant(participant);
    bottomSheetRef.current?.expand();
  }, []);

  const closeDrawer = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // Expose these methods to the parent component via ref
  useImperativeHandle(ref, () => ({
    openDrawer,
    closeDrawer,
  }));

  // Handle approving a participant
  const handleApprove = async () => {
    if (selectedParticipant) {
      await onApprove(selectedParticipant.id || selectedParticipant.userUid);
      closeDrawer();
    }
  };

  // Handle rejecting a participant
  const handleReject = async () => {
    if (selectedParticipant) {
      await onReject(selectedParticipant.id || selectedParticipant.userUid);
      closeDrawer();
    }
  };

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      index={0}
      backdropComponent={renderBackdrop}
    >
      <YStack padding="$4" gap="$4">
        {selectedParticipant && (
          <>
            <XStack gap="$3" alignItems="center">
              <Avatar circular size="$4">
                {selectedParticipant.photoURL ? (
                  <Avatar.Image src={selectedParticipant.photoURL} />
                ) : (
                  <Avatar.Fallback backgroundColor={COLORS.primary}>
                    <Text color="white" fontSize="$3">
                      {selectedParticipant.displayName?.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>
              <YStack>
                <Text fontSize="$5" fontWeight="bold">
                  {selectedParticipant.displayName}
                </Text>
                <Text fontSize="$3" color="$gray11">
                  requested to join this walk
                </Text>
              </YStack>
            </XStack>

            <XStack gap="$3" justifyContent="space-between">
              <Button
                flex={1}
                backgroundColor="$gray3"
                color="$gray11"
                borderColor="$gray5"
                borderWidth={1}
                onPress={handleReject}
              >
                Not this time
              </Button>
              <Button
                flex={1}
                backgroundColor={COLORS.primary}
                color="white"
                onPress={handleApprove}
              >
                Accept this request
              </Button>
            </XStack>
          </>
        )}
      </YStack>
    </BottomSheet>
  );
});

export default ParticipantApprovalDrawer;
