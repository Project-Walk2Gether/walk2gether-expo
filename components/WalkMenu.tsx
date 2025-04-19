import { Edit3, Map, Trash } from "@tamagui/lucide-icons";
import React from "react";
import { COLORS } from "../styles/colors";
import Menu, { MenuItem } from "./Menu";

interface WalkMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
}

export default function WalkMenu({
  onEdit,
  onDelete,
  onOpenMaps,
  hasLocation = false,
}: WalkMenuProps) {
  // Prepare menu items
  const menuItems: MenuItem[] = [
    {
      label: "Edit Walk",
      icon: <Edit3 size="$1" color={COLORS.primary} />,
      onPress: onEdit,
      buttonProps: {
        backgroundColor: COLORS.background,
        color: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.primary,
      },
    },
    // Conditionally add the Open in Maps option
    ...(hasLocation && onOpenMaps
      ? [
          {
            label: "Open in Maps",
            icon: <Map size="$1" color={COLORS.primary} />,
            onPress: onOpenMaps,
            buttonProps: {
              backgroundColor: COLORS.background,
              color: COLORS.primary,
              borderWidth: 1,
              borderColor: COLORS.primary,
            },
          },
        ]
      : []),
    {
      label: "Cancel Walk",
      icon: <Trash size="$1" />,
      onPress: onDelete,
      buttonProps: {
        theme: "red",
      },
    },
  ];

  return <Menu title="Walk Options" items={menuItems} />;
}
