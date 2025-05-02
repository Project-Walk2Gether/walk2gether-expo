import { useMaybeModalScreenContext } from "@/contexts/ModalScreenContext";
import React from "react";
import { H3, Sheet as TamaguiSheet } from "tamagui";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapPoints?: number[];
  dismissOnSnapToBottom?: boolean;
  title?: string;
  children: React.ReactNode;
  position?: number;
}

export function Sheet({
  open,
  onOpenChange,
  snapPoints = [50],
  dismissOnSnapToBottom = true,
  title,
  children,
  position,
}: SheetProps) {
  const portalHostName = useMaybeModalScreenContext()?.portalHostName;

  return (
    <TamaguiSheet
      modal={!portalHostName}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissOnSnapToBottom={dismissOnSnapToBottom}
      position={position}
      {...(portalHostName ? { portal: { name: portalHostName } } : {})}
    >
      <TamaguiSheet.Overlay />
      <TamaguiSheet.Frame padding="$4">
        <TamaguiSheet.Handle />
        {title && (
          <H3 textAlign="center" marginBottom="$4">
            {title}
          </H3>
        )}
        {children}
      </TamaguiSheet.Frame>
    </TamaguiSheet>
  );
}

// Export Sheet components to maintain the original API
Sheet.Overlay = TamaguiSheet.Overlay;
Sheet.Frame = TamaguiSheet.Frame;
Sheet.Handle = TamaguiSheet.Handle;
Sheet.ScrollView = TamaguiSheet.ScrollView;
