import { useUserData } from "@/context/UserDataContext";
import { Stack } from "expo-router";
import React from "react";
import QRCode from "react-native-qrcode-svg";
import { Spinner, Text, YStack } from "tamagui";

export default function QrCodeScreen() {
  const { userData, loading } = useUserData();
  const code = userData?.friendInvitationCode;
  const url = code ? `https://projectwalk2gether.org/join?code=${code}` : "";

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
        <QRCode value={url} size={260} backgroundColor="#fff" color="#5A4430" />
        <Text mt={32} fontSize={16} color="#5A4430" textAlign="center">
          Or share this link:
        </Text>
        <Text
          mt={8}
          fontSize={14}
          color="#7C5F45"
          textAlign="center"
          selectable
        >
          {url}
        </Text>
      </YStack>
    </>
  );
}
