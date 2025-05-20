import { useState } from "react";
import { Modal } from "react-native";
import { FullScreenImage } from "../Gallery/FullScreenImage";
import { StatelessAvatar } from "./StatelessAvatar";
import { COLORS } from "@/styles/colors";

interface Props {
  profilePicUrl?: string;
  name?: string;
  size?: number;
  borderWidth?: number;
  backgroundColor?: string;
}

/**
 * A wrapper for StatelessAvatar that opens a full-screen view when tapped
 */
export function AvatarWithFullScreenView({
  profilePicUrl,
  name,
  size = 36,
  borderWidth = 2,
  backgroundColor = COLORS.primary,
}: Props) {
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);

  const handleAvatarPress = () => {
    if (profilePicUrl) {
      setIsFullScreenVisible(true);
    }
  };

  const handleClose = () => {
    setIsFullScreenVisible(false);
  };

  return (
    <>
      <StatelessAvatar
        profilePicUrl={profilePicUrl}
        name={name}
        size={size}
        borderWidth={borderWidth}
        backgroundColor={backgroundColor}
        onPress={handleAvatarPress}
      />

      {profilePicUrl && isFullScreenVisible && (
        <Modal
          visible={isFullScreenVisible}
          animationType="fade"
          transparent={false}
          onRequestClose={handleClose}
        >
          <FullScreenImage imageUri={profilePicUrl} onClose={handleClose} />
        </Modal>
      )}
    </>
  );
}
