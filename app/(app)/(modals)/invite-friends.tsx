import { Copy, Plus, Send, X } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  Button,
  Card,
  Input,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { BrandGradient } from "../../../components/UI";
import { useFlashMessage } from "../../../context/FlashMessageContext";
import { useUserData } from "../../../context/UserDataContext";
import { callApi } from "../../../utils/api";

export default function InviteFriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData } = useUserData();
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    summary?: {
      total: number;
      successful: number;
      failed: number;
    };
    error?: string;
  } | null>(null);

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

  const handleAddPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  const handleRemovePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    } else {
      // If it's the last one, just clear it instead of removing
      setPhoneNumbers([""]);
    }
  };

  const handlePhoneNumberChange = (text: string, index: number) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = text;
    setPhoneNumbers(newPhoneNumbers);
  };

  const handleSendInvitations = async () => {
    // Filter out empty phone numbers
    const validPhoneNumbers = phoneNumbers.filter(
      (phone) => phone.trim() !== ""
    );

    if (validPhoneNumbers.length === 0) {
      Alert.alert("Error", "Please add at least one phone number");
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // Make the API call to our Firebase function using the callApi utility
      const response = await callApi("sms/send-invitations", {
        phoneNumbers: validPhoneNumbers,
        message: message,
      });

      console.log("SMS invitation response:", response);

      setSendResult({
        success: true,
        summary: response.summary,
      });

      // Clear phone numbers on success
      if (response.data.success) {
        setPhoneNumbers([""]);
      }
    } catch (error) {
      console.error("Error sending SMS invitations:", error);
      setSendResult({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BrandGradient style={{ flex: 1 }}>
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
                  <Text fontSize="$5" fontWeight="bold" color="#333">
                    Invite friends to join you on Walk2gether
                  </Text>

                  {/* Invitation Link section */}
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="500" color="#333">
                      Share Invitation Link
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
                  </YStack>

                  {/* Or divider */}
                  <XStack alignItems="center" marginVertical="$3">
                    <View height={1} backgroundColor="#ddd" flex={1} />
                    <Text fontSize="$3" color="#888" marginHorizontal="$2">
                      OR
                    </Text>
                    <View height={1} backgroundColor="#ddd" flex={1} />
                  </XStack>

                  {/* SMS Invitations section */}
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="500" color="#333">
                      Send SMS Invitations
                    </Text>

                    {/* Phone numbers input fields */}
                    <YStack gap="$2">
                      {phoneNumbers.map((phoneNumber, index) => (
                        <XStack key={index} gap="$2" alignItems="center">
                          <Input
                            flex={1}
                            size="$4"
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChangeText={(text) =>
                              handlePhoneNumberChange(text, index)
                            }
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                          />
                          <Button
                            size="$3"
                            circular
                            icon={
                              index === phoneNumbers.length - 1 &&
                              index === 0 ? (
                                <Plus size="$1" color="white" />
                              ) : (
                                <X size="$1" color="white" />
                              )
                            }
                            onPress={() =>
                              index === phoneNumbers.length - 1 && index === 0
                                ? handleAddPhoneNumber()
                                : handleRemovePhoneNumber(index)
                            }
                            backgroundColor="#7C5F45"
                          />
                        </XStack>
                      ))}

                      {phoneNumbers.length > 0 &&
                        phoneNumbers[phoneNumbers.length - 1] !== "" && (
                          <Button
                            size="$3"
                            backgroundColor="transparent"
                            color="#7C5F45"
                            onPress={handleAddPhoneNumber}
                            icon={<Plus size="$1" color="#7C5F45" />}
                            marginTop="$1"
                          >
                            Add another number
                          </Button>
                        )}
                    </YStack>

                    {/* Send button */}
                    <Button
                      backgroundColor="#7C5F45"
                      color="white"
                      size="$4"
                      onPress={handleSendInvitations}
                      icon={sending ? undefined : Send}
                      height={50}
                      marginTop="$3"
                      disabled={
                        sending || phoneNumbers.every((p) => p.trim() === "")
                      }
                    >
                      {sending ? <Spinner color="white" /> : "Send Invitations"}
                    </Button>

                    {/* Results display */}
                    {sendResult && (
                      <YStack
                        backgroundColor={
                          sendResult.success ? "#e8f5e9" : "#ffebee"
                        }
                        borderRadius="$2"
                        padding="$3"
                        marginTop="$2"
                      >
                        <Text
                          color={sendResult.success ? "#2e7d32" : "#c62828"}
                          fontSize="$3.5"
                        >
                          {sendResult.success
                            ? `Successfully sent ${
                                sendResult.summary?.successful
                              } of ${sendResult.summary?.total} invitation${
                                sendResult.summary?.total !== 1 ? "s" : ""
                              }.`
                            : `Error sending invitations: ${sendResult.error}`}
                        </Text>
                      </YStack>
                    )}
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
