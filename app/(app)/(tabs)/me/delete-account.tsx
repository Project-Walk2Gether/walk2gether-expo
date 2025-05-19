import { callApi } from "@/utils/api";
import { AlertTriangle, Trash } from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Card, Separator, Text, XStack, YStack } from "tamagui";

import { Screen } from "@/components/UI";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";

export default function DeleteAccountScreen() {
  // Set the title using expo-router
  return (
    <>
      <Stack.Screen options={{ title: "Delete Account" }} />
      <DeleteAccountContent />
    </>
  );
}

function DeleteAccountContent() {
  const [loading, setLoading] = useState(false);
  const { showMessage } = useFlashMessage();
  const { signOut } = useAuth();

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await callApi("user/delete");
      showMessage("Account successfully deleted", "success");
      await signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to delete account",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletion = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This action CANNOT be undone. All your data, walks, and connections will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Delete My Account",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Screen gradientVariant="danger">
        <YStack gap="$4" flex={1} px="$3" pt="$4">
          <Card
            backgroundColor="white"
            padding="$5"
            borderRadius={16}
            shadowColor="rgba(0,0,0,0.1)"
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 2 }}
          >
            <XStack alignItems="center" space="$3" marginBottom="$4">
              <AlertTriangle color="#DC2626" size={26} />
              <Text
                flexShrink={1}
                color="#DC2626"
                fontSize={18}
                fontWeight="700"
              >
                Warning: This action is irreversible
              </Text>
            </XStack>
            <Text color="#991B1B" marginBottom="$4" fontSize={16}>
              Deleting your account will permanently remove all your data,
              including:
            </Text>
            <YStack space="$3" marginLeft="$2">
              <XStack space="$2" alignItems="center">
                <Text color="#991B1B" fontSize={18}>
                  •
                </Text>
                <Text color="#991B1B" fontSize={16}>
                  Your profile information
                </Text>
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text color="#991B1B" fontSize={18}>
                  •
                </Text>
                <Text color="#991B1B" fontSize={16}>
                  All walks you've created
                </Text>
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text color="#991B1B" fontSize={18}>
                  •
                </Text>
                <Text color="#991B1B" fontSize={16}>
                  Your friend connections
                </Text>
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text color="#991B1B" fontSize={18}>
                  •
                </Text>
                <Text color="#991B1B" fontSize={16}>
                  All your messages
                </Text>
              </XStack>

              <Text color="#991B1B" fontSize={16}>
                Additionally, invitation links that you've sent will no longer
                work.
              </Text>
            </YStack>

            <Button
              backgroundColor={"#DC2626"}
              color={"white"}
              size="$5"
              onPress={confirmDeletion}
              icon={loading ? undefined : <Trash size={20} />}
              marginTop="$5"
              borderRadius={12}
              height={56}
              fontWeight="700"
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                "Delete My Account"
              )}
            </Button>
          </Card>

          <YStack flex={1} />

          <YStack alignItems="center">
            <Separator marginVertical="$4" width="70%" />
            <XStack alignItems="center" justifyContent="center" space="$1">
              <Text fontSize={14} color="#6B7280">
                Need help?
              </Text>
              <Text
                fontSize={14}
                color="#4B5563"
                fontWeight="600"
                textDecorationLine="underline"
                onPress={() =>
                  Linking.openURL("mailto:help@projectwalk2gether.org")
                }
              >
                Contact support
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </Screen>
    </TouchableWithoutFeedback>
  );
}
