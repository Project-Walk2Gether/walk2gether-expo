import type { IconProps } from "@tamagui/helpers-icon";
import { MoreVertical } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Button, GetProps, Sheet, Text, YStack } from "tamagui";

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
  triggerIcon?: React.ReactElement<IconProps> | undefined;
  triggerButtonProps?: Partial<GetProps<typeof Button>>;
  snapPoints?: number[];
}

export default function Menu({
  title,
  items,
  color = "white",
  triggerIcon = <MoreVertical size="$1" color={color} />,
  triggerButtonProps = {},
  snapPoints = [40],
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="$2"
        circular
        chromeless
        onPress={() => setOpen(true)}
        icon={triggerIcon}
        {...triggerButtonProps}
      />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={snapPoints}
        position={0}
        dismissOnSnapToBottom
        animation="quick"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame padding="$4" gap="$4">
          <Sheet.Handle />
          <Text fontSize="$6" fontWeight="600" textAlign="center">
            {title}
          </Text>

          <YStack gap="$4" padding="$2" marginTop="$2">
            {items.map((item, index) => (
              <Button
                key={`menu-item-${index}`}
                size="$4"
                onPress={() => {
                  setOpen(false);
                  item.onPress();
                }}
                icon={item.icon}
                {...item.buttonProps}
              >
                {item.label}
              </Button>
            ))}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
