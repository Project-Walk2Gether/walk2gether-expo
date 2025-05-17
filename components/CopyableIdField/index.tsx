import { useFlashMessage } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import { Copy, Fingerprint } from "@tamagui/lucide-icons";
import React from "react";
import { Clipboard, Pressable } from "react-native";
import { Card, Text, XStack } from "tamagui";

interface Props {
  id: string;
  label?: string;
  showFullId?: boolean;
}

export default function CopyableIdField({ 
  id, 
  label = "ID", 
  showFullId = false 
}: Props) {
  const { showMessage } = useFlashMessage();

  const handleCopy = async () => {
    try {
      await Clipboard.setString(id);
      showMessage(`${label} copied to clipboard`, "success");
    } catch (error) {
      console.error(`Error copying ${label.toLowerCase()}:`, error);
      showMessage(`Failed to copy ${label}`, "error");
    }
  };

  const displayId = showFullId ? id : `${id.substring(0, 10)}...${id.substring(id.length - 4)}`;

  return (
    <Pressable onPress={handleCopy}>
      <Card
        backgroundColor="$gray2"
        padding="$3"
        marginVertical="$2"
      >
        <XStack alignItems="center" gap="$2">
          <Fingerprint size={20} color={COLORS.textSecondary} />
          <Text fontSize="$2" fontWeight="600" color="$gray11">
            {label}:
          </Text>
          <Text fontSize="$2" color="$gray10" flexShrink={1} numberOfLines={1}>
            {displayId}
          </Text>
          <Copy size={16} color={COLORS.primary} />
        </XStack>
      </Card>
    </Pressable>
  );
}
