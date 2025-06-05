import HeaderCloseButton from "@/components/HeaderCloseButton";
import InvitationQRCode from "@/components/InvitationQRCode";
import { BrandGradient } from "@/components/UI";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { ExternalLink, Share2 } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, Spinner, Text, View, XStack, YStack } from "tamagui";

export default function InviteFriendsScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useUserData();
  const [sharing, setSharing] = useState(false);
  const invitationCode = userData?.friendInvitationCode;
  const invitationUrl = `https://projectwalk2gether.org/join?code=${invitationCode}`;
  const message = `Want to walk with me using the Walk2Gether app? Use this link to add me as a friend! \n\n${invitationUrl}`;

  const { showMessage } = useFlashMessage();

  const handleCopyMessage = async () => {
    Keyboard.dismiss();
    try {
      await Clipboard.setStringAsync(message);
      showMessage("Invitation message copied to clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy message", error);
      showMessage("Failed to copy message to clipboard", "error");
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const result = await Share.share({
        message: message,
        title: "Join me on Walk2Gether!",
      });

      if (result.action === Share.sharedAction) {
        showMessage("Invitation shared successfully!", "success");
      }
    } catch (error) {
      console.error("Error sharing invitation:", error);
      showMessage("Failed to share invitation", "error");
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <HeaderCloseButton /> }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BrandGradient variant="subtle" style={{ flex: 1 }}>
            <StatusBar style="light" />
            <View paddingHorizontal={20}>
              <Card
                backgroundColor="white"
                borderRadius="$3"
                shadowColor="#000"
                shadowOpacity={0.1}
                shadowRadius={4}
                elevation={3}
                marginVertical="$5"
              >
                <YStack padding="$4" gap="$4">
                  {/* QR Code section */}
                  <XStack ai="center" justifyContent="center">
                    <View flex={1}>
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color="#333"
                        marginBottom="$2"
                      >
                        QR Code
                      </Text>
                      <Text fontSize="$2.5" color="#666">
                        Show this QR code to friends so they can scan it with
                        their phone camera to join.
                      </Text>
                      <Link href="/qr-code" asChild>
                        <Button
                          size="$3"
                          marginTop="$2"
                          icon={<ExternalLink size="$1" />}
                        >
                          Expand
                        </Button>
                      </Link>
                    </View>
                    <View marginLeft="$4">
                      <InvitationQRCode
                        invitationCode={invitationCode}
                        size={120}
                      />
                    </View>
                  </XStack>

                  {/* Or divider */}
                  <XStack alignItems="center" marginVertical="$3">
                    <View height={1} backgroundColor="#ddd" flex={1} />
                    <Text fontSize="$3" color="#888" marginHorizontal="$2">
                      OR
                    </Text>
                    <View height={1} backgroundColor="#ddd" flex={1} />
                  </XStack>

                  {/* Share section */}
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="500" color="#333">
                      Send Invitation
                    </Text>

                    <Text fontSize="$2.5" color="#666">
                      Tap the Send button below to invite friends using your
                      device's sharing options (Messages, WhatsApp, Email, etc).
                    </Text>

                    {/* Share button */}
                    <Button
                      backgroundColor="#7C5F45"
                      color="white"
                      size="$4"
                      onPress={handleShare}
                      icon={sharing ? undefined : Share2}
                      height={50}
                      marginTop="$3"
                      disabled={sharing}
                    >
                      {sharing ? <Spinner color="white" /> : "Send Invitation"}
                    </Button>
                  </YStack>
                </YStack>
              </Card>
            </View>
          </BrandGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}
