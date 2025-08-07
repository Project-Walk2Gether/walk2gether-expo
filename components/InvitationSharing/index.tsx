import { FormControl } from "@/components/FormControl";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import { getInvitationUrl } from "@/utils/invites";
import { Check, Copy, QrCode, Share2 } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, Input, Text, XStack, YStack } from "tamagui";

export interface InvitationSharingProps {
  /**
   * The ID of the walk to invite to
   */
  walkId: string;
  /**
   * User's invitation code
   */
  invitationCode?: string;
  /**
   * Walk type, affects messaging and section display
   */
  walkType?: "friends" | "neighborhood" | "meetup";
  /**
   * Optional walk topic (for meetup walks)
   */
  walkTopic?: string;
  /**
   * Optional walk description (for meetup walks)
   */
  walkDescription?: string;
  /**
   * Whether to display the public invitation section (for meetup walks)
   */
  showPublicInvitation?: boolean;
  /**
   * Custom label for the personal invitation section
   */
  personalInvitationLabel?: string;
  /**
   * Whether sharing was successful
   */
  onShareSuccess?: () => void;
}

export const InvitationSharing: React.FC<InvitationSharingProps> = ({
  walkId,
  invitationCode,
  walkType = "friends",
  walkTopic,
  walkDescription,
  showPublicInvitation = false,
  personalInvitationLabel = "Invite participants",
  onShareSuccess,
}) => {
  const router = useRouter();
  const { showMessage } = useFlashMessage();
  const [copied, setCopied] = useState(false);

  // Generate the invitation URL
  const invitationUrl = getInvitationUrl(invitationCode, walkId);

  // Generate appropriate share message and title based on walk type
  const getShareInfo = () => {
    let defaultMessage = "";
    let title = "";

    if (walkType === "meetup") {
      defaultMessage = `Join me for a meetup walk to discuss "${
        walkTopic || "our topic"
      }"! ${
        walkDescription
          ? "We'll be talking about interesting ideas together while walking."
          : ""
      }`;
      title = "Join my Walk2Gether Meetup";
    } else if (walkType === "neighborhood") {
      defaultMessage =
        "I'm organizing a neighborhood walk. Join me for some fresh air and community connection!";
      title = "Join my Neighborhood Walk";
    } else {
      defaultMessage =
        "Join my walk on the Walk2Gether app! Use this link to join.";
      title = "Join my Walk2Gether Walk";
    }

    return { defaultMessage, title };
  };

  // Handle copying the invitation link
  const handleCopyLink = () => {
    Clipboard.setStringAsync(invitationUrl);
    setCopied(true);
    showMessage("Invitation link copied to clipboard", "success");
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle sharing the invitation
  const handleShareLink = () => {
    const { defaultMessage, title } = getShareInfo();

    router.push({
      pathname: "/(app)/(modals)/custom-share",
      params: {
        link: encodeURIComponent(invitationUrl),
        defaultMessage: encodeURIComponent(defaultMessage),
        title: encodeURIComponent(title),
      },
    });

    if (onShareSuccess) {
      onShareSuccess();
    }
  };

  // Navigate to QR code screen
  const navigateToQRCode = () => {
    router.push({
      pathname: "/qr-code",
      params: { walkCode: walkId },
    });
  };

  return (
    <YStack gap="$4">
      {/* Public invitation section - only for meetup walks */}
      {showPublicInvitation && walkType === "meetup" && (
        <YStack gap="$2">
          <FormControl label="Public invitation">
            <Text fontSize={14} color="$gray11" marginBottom="$2">
              Publish the meetup walk invitation link below to invite the public
              to join
            </Text>
            <XStack
              backgroundColor="$background"
              borderRadius={8}
              borderColor="$borderColor"
              borderWidth={1}
              alignItems="center"
              gap="$2"
            >
              <Input
                flex={1}
                value={invitationUrl}
                editable={false}
                fontSize={12}
              />
              <Button
                size="$3"
                color={COLORS.textOnDark}
                backgroundColor={copied ? COLORS.success : COLORS.primary}
                onPress={handleCopyLink}
                icon={
                  copied ? (
                    <Check size={16} color="#fff" />
                  ) : (
                    <Copy size={16} color="#fff" />
                  )
                }
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </XStack>
            <Text fontSize={12} color="$gray10" marginTop="$1">
              Tap to copy the link and share it with others
            </Text>
          </FormControl>
        </YStack>
      )}

      {/* Personal invitation section - for all walk types */}
      <FormControl label={personalInvitationLabel}>
        <XStack gap="$3" width="100%" alignItems="center">
          <Button
            backgroundColor={COLORS.primary}
            color={COLORS.textOnDark}
            onPress={handleShareLink}
            size="$4"
            flex={1}
            icon={<Share2 size={18} color="#fff" />}
            paddingHorizontal={16}
            borderRadius={8}
            hoverStyle={{ backgroundColor: "#6d4c2b" }}
            pressStyle={{ backgroundColor: "#4b2e13" }}
          >
            {walkType === "neighborhood"
              ? "Invite another neighbor"
              : walkType === "meetup"
              ? "Share invitation"
              : "Send invitation"}
          </Button>

          <Button
            backgroundColor={COLORS.secondary}
            color={COLORS.textOnDark}
            onPress={navigateToQRCode}
            size="$4"
            icon={<QrCode size={18} color="#fff" />}
            paddingHorizontal={16}
            borderRadius={8}
            hoverStyle={{ backgroundColor: "#4a95c4" }}
            pressStyle={{ backgroundColor: "#2d7fb3" }}
          >
            QR code
          </Button>
        </XStack>
      </FormControl>
    </YStack>
  );
};

export default InvitationSharing;
