import { WalkWizard } from "@/components/WalkWizard";
import { WalkFormProvider } from "@/context/WalkFormContext";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { Text } from "tamagui";

interface Props {
  friendId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NewFriendWalkSheet({ friendId, isOpen, onClose }: Props) {
  // Ref to the bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points as percentages for better cross-device compatibility
  const snapPoints = useMemo(() => [130, "90%"], []);

  // Close the sheet when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isOpen) {
          onClose();
        }
      };
    }, [isOpen, onClose])
  );

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
      />
    ),
    []
  );

  // Control the sheet when isOpen changes
  useEffect(() => {
    if (isOpen) {
      // Delay the expand call slightly to ensure the component is fully mounted
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(1);
      }, 100);
    } else {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [isOpen]);

  // Only render the component when it's open to improve performance
  if (!isOpen) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      handleStyle={styles.handle}
      containerStyle={styles.bottomSheetContainer}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <Text>Invite {friendId} on a walk</Text>
        <WalkFormProvider>
          <WalkWizard />
        </WalkFormProvider>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    zIndex: 1000,
  },
  handle: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  indicator: {
    backgroundColor: "#9CA3AF",
    width: 40,
  },
  contentContainer: {
    padding: 16,
  },
});
