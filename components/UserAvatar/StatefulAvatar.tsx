import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { UserData } from "walk2gether-shared";
import { StatelessAvatar } from "./StatelessAvatar";

interface StatefulAvatarProps {
  uid: string;
  size?: number;
  borderWidth?: number;
  backgroundColor?: string;
  onPress?: () => void;
}

/**
 * A stateful avatar component that fetches user data and displays their avatar
 */
export function StatefulAvatar({
  uid,
  size = 36,
  borderWidth = 2,
  backgroundColor = COLORS.primary,
  onPress,
}: StatefulAvatarProps) {
  const { doc: userData } = useDoc<UserData>(`users/${uid}`);

  return (
    <StatelessAvatar
      profilePicUrl={userData?.profilePicUrl}
      name={userData?.name}
      size={size}
      borderWidth={borderWidth}
      backgroundColor={backgroundColor}
      onPress={onPress}
    />
  );
}
