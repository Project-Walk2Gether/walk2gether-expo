import HeaderCloseButton from "@/components/HeaderCloseButton";
import InvitationQRCode from "@/components/InvitationQRCode";
import InvitationSharing from "@/components/InvitationSharing";
import { BrandGradient } from "@/components/UI";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { ExternalLink } from "@tamagui/lucide-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Card, Text, View, XStack, YStack } from "tamagui";

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
  const { showMessage } = useFlashMessage();
  const { walkId, addFriend } = useLocalSearchParams<{
    walkId?: string;
    addFriend?: string;
  }>();
  
  // Determine the walk type based on parameters
  // The InvitationSharing component expects a walk type
  // Since we don't have actual walk data here, we're inferring it
  const inferredWalkType = walkId ? "friends" : undefined;
  
  // Construct the invitation URL based on parameters
  const invitationCode = addFriend === "true" ? userData?.friendInvitationCode : undefined;

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
                  {/* Use our reusable InvitationSharing component */}
                  <InvitationSharing 
                    walkId={walkId || ''}
                    invitationCode={userData?.friendInvitationCode || ''}
                    walkType={inferredWalkType}
                    personalInvitationLabel="Invitation Options"
                  />
                  
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
                </YStack>
              </Card>
            </View>
          </BrandGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}
