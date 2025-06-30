import { COLORS } from "@/styles/colors";
import { getInitials } from "@/utils/userUtils";
import { Avatar, Text } from "tamagui";

interface Props {
  profilePicUrl?: string;
  name?: string;
  size?: number;
  borderWidth?: number;
  backgroundColor?: string;
  onPress?: () => void;
}

/**
 * A stateless avatar component that displays a user's profile picture or initials
 */
export function StatelessAvatar({
  profilePicUrl,
  name,
  size = 36,
  borderWidth = 2,
  backgroundColor = COLORS.primary,
  onPress,
}: Props) {
  const fontSize = size * 0.4; // Proportional font size for initials

  return (
    <Avatar
      size={size}
      circular
      borderWidth={borderWidth}
      borderColor="#fff"
      {...(onPress && { onPress, pressStyle: { opacity: 0.8 } })}
    >
      {profilePicUrl?.length ? <Avatar.Image src={profilePicUrl} /> : null}
      <Avatar.Fallback
        backgroundColor={backgroundColor}
        alignItems="center"
        justifyContent="center"
      >
        <Text
          textAlign="center"
          fontSize={fontSize}
          color="white"
          fontWeight="bold"
        >
          {name ? getInitials(name) : "?"}
        </Text>
      </Avatar.Fallback>
    </Avatar>
  );
}
