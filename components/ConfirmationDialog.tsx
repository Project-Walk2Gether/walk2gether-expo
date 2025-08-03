import React from "react";
import { AlertDialog, Button, XStack, YStack } from "tamagui";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  destructive = false,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
          mx="$4"
          p="$4"
        >
          <YStack gap="$4">
            <YStack gap="$2">
              <AlertDialog.Title fontSize={18} fontWeight="bold">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description>{description}</AlertDialog.Description>
            </YStack>

            <XStack gap="$3" justifyContent="flex-end" mt="$2">
              <AlertDialog.Cancel asChild>
                <Button variant="outlined">{cancelText}</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  backgroundColor={destructive ? "$red9" : "$blue9"}
                  color="white"
                  onPress={onConfirm}
                >
                  {confirmText}
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
