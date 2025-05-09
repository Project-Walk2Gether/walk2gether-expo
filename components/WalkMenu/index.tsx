import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { getDirectionsUrl } from "@/utils/routeUtils";
import { Edit3, Map, Trash } from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert } from "react-native";
import { Walk, WithId } from "walk2gether-shared";
import Menu, { MenuItem } from "../Menu";

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

  // Prepare menu items
  const menuItems: MenuItem[] = [
    {
      label: "Edit Walk",
      icon: <Edit3 size="$1" color={COLORS.primary} />,
      onPress: () => router.push(`/walks/${walk.id}/edit`),
      buttonProps: {
        backgroundColor: COLORS.background,
        color: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.primary,
      },
    },
    // Conditionally add the Open in Maps option
    ...(hasLocation
      ? [
          {
            label: "Open in Maps",
            icon: <Map size="$1" color={COLORS.primary} />,
            onPress: onOpenMaps || openDirections,
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
