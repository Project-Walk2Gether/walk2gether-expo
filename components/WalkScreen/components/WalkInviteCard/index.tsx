import { useFlashMessage } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import { QrCode, Share2 } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { Share } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";
import WalkDetailsCard from "../WalkDetailsCard";

interface Props {
  walkId: string;
}

/**
 * Card component for walk invite actions
 */
export default function WalkInviteCard({ walkId }: Props) {
  const { showMessage } = useFlashMessage();

  // Handle sharing the walk invitation
  const handleShareInvitation = async () => {
    try {
      const shareUrl = `https://walk2gether.app/invite/${walkId}`;
      await Share.share({
        title: "Join my walk on Walk2Gether",
        message: `I'd like to invite you to join my walk on Walk2Gether! ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error("Error sharing invitation:", error);
      showMessage("Failed to share invitation", "error");
    }
  };

  return (
    <WalkDetailsCard title="Invite Others" testID="walk-invite-card">
      <YStack w="100%" gap="$2">
        <Text>Invite friends, family or others to join this walk</Text>

        {/* Invite Buttons */}
        <XStack gap="$3" width="100%" alignItems="center" pt="$2">
          <Button
            backgroundColor={COLORS.primary}
            color={COLORS.textOnDark}
            onPress={handleShareInvitation}
            size="$3"
            flex={1}
            icon={<Share2 size={16} color="#fff" />}
            borderRadius={8}
          >
            Share Invitation
          </Button>

          <Button
            backgroundColor={COLORS.secondary}
            color={COLORS.textOnDark}
            onPress={() =>
              router.push({
                pathname: "/qr-code",
                params: { walkCode: walkId },
              })
            }
            size="$3"
            icon={<QrCode size={16} color="#fff" />}
            borderRadius={8}
          >
            QR Code
          </Button>
        </XStack>

        <Button
          mt="$2"
          variant="outlined"
          onPress={() =>
            router.push({
              pathname: "/invite",
              params: { walkId: walkId },
            })
          }
        >
          Invite from Friends List
        </Button>
      </YStack>
    </WalkDetailsCard>
  );
}
