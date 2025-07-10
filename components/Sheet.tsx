import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet } from "react-native";
import { H3 } from "tamagui";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapPoints?: number[];
  dismissOnSnapToBottom?: boolean;
  title?: string;
  children: React.ReactNode;
  position?: number;
}

export interface SheetRef {
  close: () => void;
}

export const Sheet = forwardRef<SheetRef, SheetProps>(
  (
    {
      open,
      onOpenChange,
      snapPoints,
      dismissOnSnapToBottom = true,
      title,
      children,
    }: SheetProps,
    ref
  ) => {
    // Create ref for the bottom sheet
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      close: () => {
        bottomSheetRef.current?.close();
        onOpenChange(false);
      },
    }));

    // Callbacks for sheet actions
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onOpenChange(false);
        }
      },
      [onOpenChange]
    );

    // Backdrop component for the bottom sheet
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    // Effect to handle opening and closing the sheet
    React.useEffect(() => {
      if (open) {
        bottomSheetRef.current?.expand();
      } else {
        bottomSheetRef.current?.close();
      }
    }, [open]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={open ? 0 : -1}
        enablePanDownToClose={dismissOnSnapToBottom}
        backdropComponent={renderBackdrop}
        enableDynamicSizing
        onChange={handleSheetChanges}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          {title && (
            <H3 textAlign="center" marginBottom="$4">
              {title}
            </H3>
          )}
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

// Styles for the bottom sheet
const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "white",
  },
  indicator: {
    backgroundColor: "#CDCDCD",
    width: 40,
    height: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
});

// Export Sheet components to maintain the original API
// Using type assertion to add ScrollView property to Sheet
(Sheet as any).ScrollView = BottomSheetScrollView;
