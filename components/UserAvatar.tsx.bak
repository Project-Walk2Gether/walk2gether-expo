import { Avatar, Text } from "tamagui";
import { UserData } from "walk2gether-shared";
import { COLORS } from "../styles/colors";
import { useDoc } from "../utils/firestore";
import { getInitials } from "../utils/userUtils";

interface UserAvatarProps {
  uid: string;
  size?: number;
  borderWidth?: number;
  backgroundColor?: string;
}

export function UserAvatar({
  uid,
  size = 36,
  borderWidth = 2,
  backgroundColor = COLORS.primary,
}: UserAvatarProps) {
  const { doc: userData } = useDoc<UserData>(`users/${uid}`);
  const fontSize = size * 0.4; // Proportional font size for initials

  return (
    <Avatar size={size} circular borderWidth={borderWidth} borderColor="#fff">
      <Avatar.Image src={userData?.profilePicUrl || undefined} />
      <Avatar.Fallback
        justifyContent="center"
        alignItems="center"
        backgroundColor={backgroundColor}
      >
        <Text fontSize={fontSize} color="white" fontWeight="bold">
          {userData?.name ? getInitials(userData.name) : "..."}
        </Text>
      </Avatar.Fallback>
    </Avatar>
  );
}
