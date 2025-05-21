import { MenuItem, useMenu } from "@/context/MenuContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import { Edit3, MoreVertical, Trash, UserPlus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Button } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
  hideInviteOption?: boolean;
  afterDelete?: () => void;
}

export default function WalkMenu({ walk, hideInviteOption = false, afterDelete }: Props) {
  const router = useRouter();
  const { showMenu } = useMenu();
  const { showMessage } = useFlashMessage();

  const onDelete = useCallback(() => {
    walk._ref.delete();
    
    // Show confirmation message
    showMessage("Walk has been cancelled", "success");
    
    // If afterDelete is provided, call it after deletion
    if (afterDelete) {
      afterDelete();
    }
  }, [walk._ref, afterDelete, showMessage]);

  const handleShowMenu = useCallback(() => {
    // Use the MenuItem type from the MenuContext
    const menuItems: MenuItem[] = [
      {
        label: "Edit Walk",
        icon: <Edit3 size="$1" color={COLORS.primary} />,
        onPress: () => router.push(`/walks/${walk.id}/edit`),
      },
    ];

    // Only add the Invite Friends option if not hidden
    if (!hideInviteOption) {
      menuItems.push({
        label: "Invite Friends",
        icon: <UserPlus size="$1" color={COLORS.primary} />,
        onPress: () => router.push(`/walks/${walk.id}/invite`),
      });
    }

    // // Conditionally add the Open in Maps option
    // if (hasLocation) {
    //   menuItems.push({
    //     label: "Open in Maps",
    //     icon: <Map size="$1" color={COLORS.primary} />,
    //     onPress: onOpenMaps || openDirections,
    //   });
    // }

    // Add the Cancel Walk option at the end
    menuItems.push({
      label: "Cancel Walk",
      icon: <Trash size="$1" />,
      onPress: onDelete,
      theme: "red",
    });

    showMenu("Walk Options", menuItems);
  }, [walk.id, showMenu, router, onDelete, hideInviteOption]);

  return (
    <Button
      size="$2"
      circular
      chromeless
      onPress={handleShowMenu}
      icon={<MoreVertical size="$1" color="black" />}
    />
  );
}
