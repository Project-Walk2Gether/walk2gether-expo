import { Edit3, Map, Trash } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Walk, WithId } from "walk2gether-shared";
import { COLORS } from "../../styles/colors";
import Menu, { MenuItem } from "../Menu";

interface Props {
  walk: WithId<Walk>;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
}

export default function WalkMenu({
  walk,
  onOpenMaps,
  hasLocation = false,
}: Props) {
  const router = useRouter();

  const onDelete = useCallback(() => {
    walk._ref.delete();
    router.push("/");
  }, [walk._ref]);

  // Prepare menu items
  const menuItems: MenuItem[] = [
    {
      label: "Edit Walk",
      icon: <Edit3 size="$1" color={COLORS.primary} />,
      onPress: () => router.push(`/walk/${walk.id}/edit`),
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

  return <Menu color="black" title="Walk Options" items={menuItems} />;
}
