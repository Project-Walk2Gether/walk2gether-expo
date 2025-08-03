import { WalkTypeKey } from "@/utils/walkType";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Text, XStack } from "tamagui";

interface Props {
  type: WalkTypeKey | "all";
  title: string;
  icon?: string;
  color: string;
  backgroundColor: string;
  isActive: boolean;
  onSelect: (type: WalkTypeKey | "all") => void;
}

/**
 * FilterPill component used for filtering content by type
 */
const FilterPill = ({
  type,
  title,
  icon,
  color,
  backgroundColor,
  isActive,
  onSelect,
}: Props) => (
  <TouchableOpacity
    onPress={() => onSelect(type)}
    style={{
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isActive ? color : backgroundColor,
      opacity: isActive ? 1 : 0.8,
    }}
    activeOpacity={0.7}
  >
    <XStack alignItems="center" gap="$1">
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={isActive ? "white" : color}
        />
      )}
      <Text
        fontSize={14}
        fontWeight={isActive ? "bold" : "normal"}
        color={isActive ? "white" : color}
      >
        {title}
      </Text>
    </XStack>
  </TouchableOpacity>
);

export default FilterPill;
