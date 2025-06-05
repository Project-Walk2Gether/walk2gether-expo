import HeaderCloseButton from "@/components/HeaderCloseButton";
import InvitationQRCode from "@/components/InvitationQRCode";
import { useUserData } from "@/context/UserDataContext";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacer, Spinner, Text, YStack } from "tamagui";

export default function QrCodeScreen() {
  const { userData, loading } = useUserData();
  const { walkCode } = useLocalSearchParams<{ walkCode: string }>();
  const code = userData?.friendInvitationCode;
  const insets = useSafeAreaInsets();

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
        options={{
          title: "My QR Code",
          headerBackTitle: "Profile",
          headerRight: () => <HeaderCloseButton />,
        }}
      ></Stack.Screen>
      <YStack
        pb={insets.bottom}
        f={1}
        jc="center"
        ai="center"
        bg="#fff"
        px={24}
      >
        <Text
          fontSize={22}
          fontWeight="700"
          color="#5A4430"
          mb={24}
          textAlign="center"
        >
          {walkCode
            ? "Invite a friend to this walk"
            : "Show this QR code to invite friends"}
        </Text>
        <Spacer f={1} />

        <InvitationQRCode
          invitationCode={code}
          walkCode={walkCode}
          size={260}
          showText={true}
        />
        <Spacer f={2} />
      </YStack>
    </>
  );
}
