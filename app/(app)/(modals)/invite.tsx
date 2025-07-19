import HeaderCloseButton from "@/components/HeaderCloseButton";
import InvitationQRCode from "@/components/InvitationQRCode";
import { BrandGradient } from "@/components/UI";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { getInvitationUrl } from "@/utils/invites";
import { Check, Copy, ExternalLink, Share2 } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Card, Input, Text, View, XStack, YStack } from "tamagui";

export default function InviteFriendsScreen() {
  // Function to get the screen title based on parameters
  const getScreenTitle = () => {
    if (addFriend === "true" && walkId) {
      return "Invite to Walk & Connect";
    } else if (addFriend === "true") {
      return "Add Friend";
    } else if (walkId) {
      return "Invite to Walk";
    } else {
      return "Share App";
    }
  };
  const { userData } = useUserData();
  const router = useRouter();
  const { showMessage } = useFlashMessage();
  const [copied, setCopied] = useState(false);
  const { walkId, addFriend } = useLocalSearchParams<{
    walkId?: string;
    addFriend?: string;
  }>();
  
  // Construct the invitation URL based on parameters
  const invitationCode = addFriend === "true" ? userData?.friendInvitationCode : undefined;
  const invitationUrl = getInvitationUrl(invitationCode, walkId);
  
  // Customize message based on what's being shared
  let message: string;
  if (addFriend === "true" && walkId) {
    message = `Want to walk with me using the Walk2Gether app? Use this link to add me as a friend and join my walk! \n\n${invitationUrl}`;
  } else if (addFriend === "true") {
    message = `Want to walk with me using the Walk2Gether app? Use this link to add me as a friend! \n\n${invitationUrl}`;
  } else if (walkId) {
    message = `Join my walk on the Walk2Gether app! Use this link to join. \n\n${invitationUrl}`;
  } else {
    message = `Check out the Walk2Gether app! \n\n${invitationUrl}`;
  }

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

  const handleShare = () => {
    // Navigate to custom share screen with necessary parameters
    let defaultMessage = "";
    let title = "";
    
    if (addFriend === "true" && walkId) {
      defaultMessage = "Want to walk with me using the Walk2Gether app? Use this link to add me as a friend and join my walk!";
      title = "Join me on Walk2Gether!";
    } else if (addFriend === "true") {
      defaultMessage = "Want to walk with me using the Walk2Gether app? Use this link to add me as a friend!";
      title = "Connect with me on Walk2Gether!";
    } else if (walkId) {
      defaultMessage = "Join my walk on the Walk2Gether app! Use this link to join.";
      title = "Join my Walk2Gether event!";
    } else {
      defaultMessage = "Check out the Walk2Gether app!";
      title = "Check out Walk2Gether!";
    }

    router.push({
      pathname: "/(app)/(modals)/custom-share",
      params: {
        link: encodeURIComponent(invitationUrl),
        defaultMessage: encodeURIComponent(defaultMessage),
        title: encodeURIComponent(title),
      },
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerRight: () => <HeaderCloseButton />,
          title: getScreenTitle()
        }} 
      />
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
                  {/* Invitation URL section */}
                  <YStack w="100%" gap="$2">
                    <Text fontSize="$4" fontWeight="500" color="#333" marginBottom="$1">
                      Invitation Link
                    </Text>
                    <XStack
                      backgroundColor="#f5f5f5"
                      borderRadius={8}
                      borderColor="#ddd"
                      borderWidth={1}
                      padding="$2"
                      alignItems="center"
                      space="$2"
                      width="100%"
                    >
                      <Input
                        flex={1}
                        value={invitationUrl}
                        editable={false}
                        fontSize={14}
                        backgroundColor="#f5f5f5"
                      />
                      <Button
                        size="$3"
                        color="white"
                        backgroundColor={copied ? "#4CAF50" : "#7C5F45"}
                        onPress={() => {
                          Clipboard.setStringAsync(invitationUrl);
                          setCopied(true);
                          showMessage("Invitation link copied to clipboard", "success");
                          // Reset copied state after 2 seconds
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        icon={copied ? <Check size={16} color="#fff" /> : <Copy size={16} color="#fff" />}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </XStack>
                    <Text fontSize={13} color="#666" marginTop="$1">
                      Tap to copy the link and share it with others
                    </Text>
                  </YStack>
                  
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
                      <Text fontSize={15} color="#666">
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
                        walkCode={walkId}
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

                    <Text fontSize={15} color="#666">
                      Tap the Send button below to invite friends using your
                      device's sharing options (Messages, WhatsApp, Email, etc).
                    </Text>

                    {/* Share button */}
                    <Button
                      backgroundColor="#7C5F45"
                      color="white"
                      size="$4"
                      onPress={handleShare}
                      icon={Share2}
                      height={50}
                      marginTop="$3"
                    >
                      Send Invitation
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
