import { MoreVertical } from "@tamagui/lucide-icons";
import React from "react";
import { Button } from "tamagui";
import { MenuItem, useMenu } from "../context/MenuContext";

interface MenuButtonProps {
  title: string;
  items: MenuItem[];
  color?: string;
  trigger?: React.ReactNode;
  portalHostName?: string;
}

export default function MenuButton({
  title,
  items,
  color,
  trigger,
  portalHostName,
}: MenuButtonProps) {
  const { showMenu } = useMenu();

  const handlePress = () => {
    showMenu(title, items, { portalHostName });
  };

  // If custom trigger is provided, clone it with onPress handler
  if (trigger) {
    return React.cloneElement(trigger as React.ReactElement<any>, {
      onPress: handlePress,
    });
  }

  // Default trigger is a three-dot menu button
  return (
    <Button
      size="$2"
      circular
      chromeless
      onPress={handlePress}
      icon={<MoreVertical size="$1" color={color} />}
    />
  );
}
