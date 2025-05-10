import { useUserData } from "@/context/UserDataContext";
import InvitationQRCode from "@/components/InvitationQRCode";
import { Stack } from "expo-router";
import React from "react";
import { Spinner, Text, YStack } from "tamagui";

export default function QrCodeScreen() {
  const { userData, loading } = useUserData();
  const code = userData?.friendInvitationCode;

  if (loading) {
    return (
      <YStack
        f={1}
        jc="center"
        ai="center"
        bg="#fff"
        width="100%"
        height="100%"
      >
        <Spinner size="large" color="#5A4430" />
      </YStack>
    );
  }

  if (!code) {
    return (
      <YStack
        f={1}
        jc="center"
        ai="center"
        bg="#fff"
        width="100%"
        height="100%"
      >
        <Text fontSize={18} color="#5A4430">
          No invitation code found.
        </Text>
      </YStack>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: "My QR Code", headerBackTitle: "Profile" }}
      ></Stack.Screen>
      <YStack f={1} jc="center" ai="center" bg="#fff" px={24}>
        <Text
          fontSize={22}
          fontWeight="700"
          color="#5A4430"
          mb={24}
          textAlign="center"
        >
          Show this QR code to invite friends
        </Text>
        <InvitationQRCode invitationCode={code} size={260} showText={true} />
      </YStack>
    </>
  );
}
