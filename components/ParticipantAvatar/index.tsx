import { COLORS } from "@/styles/colors";
import React from "react";
import { Avatar, Text } from "tamagui";

interface Props {
  photoURL?: string | null;
  displayName?: string;
  size?: "$2" | "$3" | "$4" | "$5";
  borderColor?: string;
  borderWidth?: number;
}

export default function ParticipantAvatar({
  photoURL,
  displayName,
  size = "$3",
  borderColor,
  borderWidth,
}: Props) {
  const avatarStyle = {
    ...(borderWidth && borderColor
      ? { borderWidth, borderColor }
      : {}),
  };

  return (
    <Avatar circular size={size} style={avatarStyle}>
      {photoURL ? (
        <Avatar.Image src={photoURL} />
      ) : (
        <Avatar.Fallback
          justifyContent="center"
          alignItems="center"
          backgroundColor={COLORS.primary}
        >
          <Text color="white" fontSize={size === "$2" ? "$1" : "$2"}>
            {displayName?.charAt(0).toUpperCase() || "?"}
          </Text>
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}
