import { Avatar, Image, Text, View } from "tamagui";
import { UserData } from "walk2gether-shared";
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
  backgroundColor = "#E0E0E0"
}: UserAvatarProps) {
  const { doc: userData } = useDoc<UserData>(`users/${uid}`);

  const borderRadius = size / 2;
  const fontSize = size * 0.4; // Proportional font size

  if (!userData?.profilePicUrl) {
    return (
      <View
        width={size}
        height={size}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        justifyContent="center"
        alignItems="center"
        borderWidth={borderWidth}
        borderColor="#fff"
      >
        <Text fontWeight="bold" fontSize={fontSize} color="white">
          {userData?.name ? getInitials(userData.name) : "..."}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: userData.profilePicUrl }}
      width={size}
      height={size}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      borderColor="#fff"
    />
  );
}

