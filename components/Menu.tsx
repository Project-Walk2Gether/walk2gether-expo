import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { IconProps } from "@tamagui/helpers-icon";
import { MoreVertical } from "@tamagui/lucide-icons";
import { useMaybePortalHostContext } from "@/context/PortalHostContext";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, GetProps, Portal, Text, YStack } from "tamagui";

export interface MenuItem {
  label: string;
  icon?: React.ReactElement<IconProps> | undefined;
  onPress: () => void;
  buttonProps?: Partial<GetProps<typeof Button>>;
}

interface Props {
  title: string;
  color?: string;
  items: MenuItem[];
  trigger?: React.ReactNode;
  portalHostName?: string;
}

export default function Menu({ title, items, color, trigger, portalHostName }: Props) {
  const [open, setOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.expand();
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    setOpen(false);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleItemPress = useCallback((item: MenuItem) => {
    handleClose();
    setTimeout(() => {
      item.onPress();
    }, 300); // Slight delay to ensure sheet is closed before action
  }, []);

  // Access the portal context from the parent component, if available
  const portalContext = useMaybePortalHostContext();
  const resolvedPortalName = portalHostName || portalContext?.portalHostName;
  
  // Create the trigger button
  const triggerButton = trigger ? (
    React.cloneElement(trigger as React.ReactElement<any>, {
      onPress: handleOpen,
    })
  ) : (
    <Button
      size="$2"
      circular
      chromeless
      onPress={handleOpen}
      icon={<MoreVertical size="$1" color={color} />}
    />
  );

  // Create the menu content
  const menuContent = open && (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing={true}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      style={styles.bottomSheet}
      handleIndicatorStyle={styles.indicator}
    >
      <YStack padding="$4" gap="$4">
        <Text fontSize="$6" fontWeight="600" textAlign="center">
          {title}
        </Text>

        <YStack gap="$4" padding="$2" marginTop="$2">
          {items.map((item, index) => (
            <Button
              key={`menu-item-${index}`}
              size="$4"
              onPress={() => handleItemPress(item)}
              icon={item.icon}
              {...item.buttonProps}
            >
              {item.label}
            </Button>
          ))}
        </YStack>
      </YStack>
    </BottomSheet>
  );

  return (
    <>
      {triggerButton}
      {resolvedPortalName && menuContent ? (
        // Render in a portal if we have a portal host name
        <Portal>
          {menuContent}
        </Portal>
      ) : (
        // Otherwise render normally
        menuContent
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
});
