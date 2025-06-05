import { Pencil } from "@tamagui/lucide-icons";
import React from "react";
import { View, ViewProps } from "tamagui";

type Props = {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  onPress?: () => void;
} & ViewProps;

export default function EditButton({
  size = 36,
  backgroundColor = "#4EB1BA", // COLORS.primary default
  iconColor = "white",
  onPress,
  ...rest
}: Props) {
  const iconSize = Math.floor(size / 2);

  return (
    <View
      backgroundColor={backgroundColor}
      width={size}
      height={size}
      borderRadius={size / 2}
      justifyContent="center"
      alignItems="center"
      borderWidth={2}
      borderColor="white"
      pressStyle={onPress ? { opacity: 0.8 } : undefined}
      onPress={onPress}
      {...rest}
    >
      <Pencil size={iconSize} color={iconColor} />
    </View>
  );
}
