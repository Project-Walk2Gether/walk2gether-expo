import HeaderCloseButton from "@/components/HeaderCloseButton";
import { BrandGradient } from "@/components/UI";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import { Share2 } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Card, Input, Spinner, Text, View, YStack } from "tamagui";

export default function CustomShareScreen() {
  const { showMessage } = useFlashMessage();
  const router = useRouter();

  // Get parameters from URL
  const params = useLocalSearchParams<{
    link: string;
    defaultMessage: string;
    title: string;
  }>();

  const link = decodeURIComponent(params.link || "");
  const title = decodeURIComponent(params.title || "Invite to Walk2Gether");
  const defaultText = decodeURIComponent(params.defaultMessage || "");

  const [customMessage, setCustomMessage] = useState(defaultText);
  const [sharing, setSharing] = useState(false);

  // Function to handle sharing with customized message
  const handleShare = async () => {
    try {
      setSharing(true);

      // Prepare the message with the link
      const fullMessage = `${customMessage} ${link}`;

      const result = await Share.share({
        message: fullMessage,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        showMessage("Invitation shared successfully!", "success");
        // Close the modal after successful sharing
        router.back();
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
      <Stack.Screen
        options={{
          title: "Customize Message",
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={120}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BrandGradient variant="subtle" style={{ flex: 1 }}>
            <StatusBar style="light" />
            <View paddingHorizontal={20} flex={1}>
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
                <YStack padding="$4" gap="$4" flex={1}>
                  <Text fontSize="$4" fontWeight="500" color="#333">
                    Customize your invitation message
                  </Text>

                  <Text fontSize="$2" color="#666">
                    Enter your personalized message below. The invitation link
                    will be added automatically.
                  </Text>

                  <Input
                    value={customMessage}
                    onChangeText={setCustomMessage}
                    placeholder="Enter your message here"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    paddingVertical={12}
                    fontSize="$3"
                    autoFocus
                    flex={1}
                  />

                  <YStack marginTop="auto" gap="$2">
                    <Text fontSize="$2" color="#666" fontStyle="italic">
                      The link will be automatically appended to your message.
                    </Text>

                    <Button
                      backgroundColor={COLORS.primary}
                      color={COLORS.textOnDark}
                      size="$4"
                      onPress={handleShare}
                      icon={
                        sharing ? undefined : <Share2 size={18} color="#fff" />
                      }
                      height={50}
                      marginTop="$3"
                      disabled={sharing}
                      borderRadius={8}
                      hoverStyle={{ backgroundColor: "#6d4c2b" }}
                      pressStyle={{ backgroundColor: "#4b2e13" }}
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
