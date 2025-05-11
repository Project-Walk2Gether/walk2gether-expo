import { useFlashMessage } from "@/context/FlashMessageContext";
import Clipboard from "@react-native-clipboard/clipboard";
import React from "react";
import { Text, YStack } from "tamagui";

interface UIDInfoProps {
  uid: string;
  version: string;
}

/**
 * UIDInfo component for showing user ID and app version with copy functionality
 */
const UIDInfo: React.FC<UIDInfoProps> = ({ uid, version }) => {
  const { showMessage } = useFlashMessage();

  const handleCopy = () => {
    Clipboard.setString(uid);
    showMessage("User ID copied to clipboard!", "success");
  };

  return (
    <YStack mt={10} ai="center" mb={20}>
      <Text
        fontSize={12}
        opacity={0.7}
        selectable
        onPress={handleCopy}
        pressStyle={{ opacity: 0.5 }}
        style={{ textAlign: "center" }}
      >
        User ID: {uid}
      </Text>

      <Text fontSize={10} opacity={0.5} style={{ textAlign: "center" }}>
        Tap to copy
      </Text>
    </YStack>
  );
};

export default UIDInfo;
