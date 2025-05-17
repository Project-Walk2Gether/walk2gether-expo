import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { COLORS } from "@/styles/colors";
import { getDirectionsUrl } from "@/utils/routeUtils";
import { Edit3, Map, MoreVertical, Trash, UserPlus } from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert } from "react-native";
import { Button } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
}

export default function WalkMenu({
  walk,
  onOpenMaps,
  hasLocation = true, // Changed the default to true since most walks have locations
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { showMenu } = useMenu();

  const onDelete = useCallback(() => {
    walk._ref.delete();
    router.push("/");
  }, [walk._ref]);

  // Implementation of openDirections function moved from LiveWalkMap
  const openDirections = useCallback(async () => {
    if (!user || !walk.id) return;

    const directionsUrl = await getDirectionsUrl(walk.id, user.uid);
    if (directionsUrl) {
      Linking.openURL(directionsUrl);
    } else {
      Alert.alert("Error", "Could not generate directions. Please try again.");
    }
  }, [walk.id, user]);

  const handleShowMenu = useCallback(() => {
    showMenu("Walk Options", [
      {
        label: "Edit Walk",
        icon: <Edit3 size="$1" color={COLORS.primary} />,
        onPress: () => router.push(`/walks/${walk.id}/edit`),
      },
      // Add Invite Friends option
      {
        label: "Invite Friends",
        icon: <UserPlus size="$1" color={COLORS.primary} />,
        onPress: () => router.push(`/walks/${walk.id}/invite`),
      },
      // Conditionally add the Open in Maps option
      ...(hasLocation
        ? [
            {
              label: "Open in Maps",
              icon: <Map size="$1" color={COLORS.primary} />,
              onPress: onOpenMaps || openDirections,
            },
          ]
        : []),
      {
        label: "Cancel Walk",
        icon: <Trash size="$1" />,
        onPress: onDelete,
        theme: "red",
      },
    ]);
  }, [walk.id, showMenu, router, onOpenMaps, openDirections, onDelete, hasLocation]);

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
