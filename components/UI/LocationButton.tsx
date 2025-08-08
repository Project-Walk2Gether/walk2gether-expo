import { COLORS } from "@/styles/colors";
import { MapPin } from "@tamagui/lucide-icons";
import React from "react";
import { Button, ButtonProps } from "tamagui";

interface Props extends Omit<ButtonProps, "children"> {
  loading?: boolean;
  text?: string;
}

export const LocationButton: React.FC<Props> = ({
  loading = false,
  text = "Use my current location",
  ...props
}) => {
  return (
    <Button
      size="$4"
      backgroundColor="$blue9"
      color="black"
      bg={COLORS.accent2}
      icon={<MapPin size={20} style={{ marginRight: 8 }} />}
      pressStyle={{ opacity: 0.8 }}
      {...props}
    >
      {loading ? "Getting location..." : text}
    </Button>
  );
};

export default LocationButton;
