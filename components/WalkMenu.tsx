import React, { useState } from "react";
import { Sheet, Button, YStack, Text } from "tamagui";
import { MoreVertical, Edit3, Trash, Navigation, Map } from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/styles/colors";

interface WalkMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
}

export default function WalkMenu({ onEdit, onDelete, onOpenMaps, hasLocation = false }: WalkMenuProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Button
        size="$2"
        circular
        chromeless
        onPress={() => setOpen(true)}
        icon={<MoreVertical size="$1" color="white" />}
      />

      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[30]}
        position={0}
        dismissOnSnapToBottom
        animation="quick"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame padding="$4" gap="$4" paddingBottom={insets.bottom + 16}>
          <Sheet.Handle />
          <Text fontSize="$6" fontWeight="600" textAlign="center">
            Walk Options
          </Text>

          <YStack gap="$4" padding="$2" marginTop="$2">
            <Button
              size="$4" 
              backgroundColor={COLORS.background}
              color={COLORS.primary}
              borderWidth={1}
              borderColor={COLORS.primary}
              onPress={() => {
                setOpen(false);
                onEdit();
              }}
              icon={<Edit3 size="$1" color={COLORS.primary} />}
            >
              Edit Walk
            </Button>
            
            {hasLocation && onOpenMaps && (
              <Button
                size="$4"
                backgroundColor={COLORS.background}
                color={COLORS.primary}
                borderWidth={1}
                borderColor={COLORS.primary}
                onPress={() => {
                  setOpen(false);
                  onOpenMaps();
                }}
                icon={<Map size="$1" color={COLORS.primary} />}
              >
                Open in Maps
              </Button>
            )}
            
            <Button
              size="$4"
              theme="red"
              onPress={() => {
                setOpen(false);
                onDelete();
              }}
              icon={<Trash size="$1" />}
            >
              Cancel Walk
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
