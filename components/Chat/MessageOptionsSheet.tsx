import { Trash2 } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Sheet, Text, YStack } from "tamagui";
import { Message } from "walk2gether-shared";

interface MessageOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMessage: Message | null;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function MessageOptionsSheet({
  open,
  onOpenChange,
  selectedMessage,
  onDeleteMessage,
}: MessageOptionsSheetProps) {
  const handleDelete = async () => {
    if (selectedMessage?.id) {
      await onDeleteMessage(selectedMessage.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[25]}
      dismissOnSnapToBottom
      position={0}
      zIndex={100_000}
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$4">
        <YStack gap="$4">
          <Text fontSize="$6" fontWeight="bold" textAlign="center">
            Message Options
          </Text>

          <Button
            backgroundColor="$red5"
            pressStyle={{ backgroundColor: "$red8" }}
            onPress={handleDelete}
            icon={<Trash2 size="$1" color="$red10" />}
            alignSelf="center"
            width="80%"
          >
            <Text color="$red10" fontWeight="bold">
              Delete Message
            </Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
