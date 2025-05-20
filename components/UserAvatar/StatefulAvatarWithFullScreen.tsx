import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { UserData } from "walk2gether-shared";
import { AvatarWithFullScreenView } from "./AvatarWithFullScreenView";

interface Props {
  uid: string;
  size?: number;
  borderWidth?: number;
  backgroundColor?: string;
}

/**
 * A stateful avatar component that fetches user data and displays their avatar with full-screen view capability
 */
export function StatefulAvatarWithFullScreen({
  uid,
  size = 36,
  borderWidth = 2,
  backgroundColor = COLORS.primary,
}: Props) {
  const { doc: userData } = useDoc<UserData>(`users/${uid}`);

  return (
    <AvatarWithFullScreenView
      profilePicUrl={userData?.profilePicUrl}
      name={userData?.name}
      size={size}
      borderWidth={borderWidth}
      backgroundColor={backgroundColor}
    />
  );
}
