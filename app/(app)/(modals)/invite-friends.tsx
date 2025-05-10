import { BrandGradient } from "@/components/UI";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { Copy, Share2 } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
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
import Toast from "react-native-toast-message";
import { Button, Card, Spinner, Text, View, XStack, YStack } from "tamagui";

export default function InviteFriendsScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useUserData();
  const [sharing, setSharing] = useState(false);

  const invitationUrl = `https://projectwalk2gether.org/join?code=${userData?.friendInvitationCode}`;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BrandGradient variant="subtle" style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Toast topOffset={10} />
            <View
              flex={1}
              paddingHorizontal={20}
              paddingTop={insets.top + 10}
              paddingBottom={insets.bottom + 20}
            >
              <Card
                backgroundColor="white"
                borderRadius="$3"
                shadowColor="#000"
                shadowOpacity={0.1}
                shadowRadius={4}
                elevation={3}
                marginVertical="$5"
                flex={1}
              >
                <YStack padding="$4" gap="$4">
                  {/* Invitation Link section */}
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="500" color="#333">
                      Invitation Link
                    </Text>
                    <XStack
                      backgroundColor="#f5f5f5"
                      borderRadius="$2"
                      padding="$3"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text
                        fontSize="$3"
                        color="#666"
                        flex={1}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {invitationUrl}
                      </Text>
                      <Button
                        size="$3"
                        backgroundColor="#7C5F45"
                        color="white"
                        onPress={handleCopyMessage}
                        marginLeft="$2"
                        icon={<Copy size="$1" color="white" />}
                      >
                        Copy
                      </Button>
                    </XStack>
                    <Text fontSize="$2.5" color="#666" marginTop="$1">
                      Tap "Copy" to copy a personalized invitation message with
                      your link. You can then share this message with friends
                      via your preferred messaging app or social media platform.
                    </Text>
                  </YStack>

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
                      Share Invitation
                    </Text>

                    <Text fontSize="$2.5" color="#666">
                      Tap the Share button below to invite friends using your
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
                      {sharing ? <Spinner color="white" /> : "Share Invitation"}
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
