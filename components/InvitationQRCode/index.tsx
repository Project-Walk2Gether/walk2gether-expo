import React from "react";
import QRCode from "react-native-qrcode-svg";
import { YStack, Text } from "tamagui";

interface Props {
  invitationCode?: string;
  size?: number;
  showText?: boolean;
}

export const getInvitationUrl = (code?: string): string => {
  return code ? `https://projectwalk2gether.org/join?code=${code}` : "";
};

export default function InvitationQRCode({ 
  invitationCode, 
  size = 260, 
  showText = false 
}: Props) {
  const url = getInvitationUrl(invitationCode);

  if (!invitationCode) {
    return null;
  }

  return (
    <YStack ai="center">
      <QRCode 
        value={url} 
        size={size} 
        backgroundColor="#fff" 
        color="#5A4430" 
      />
      {showText && (
        <>
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
        </>
      )}
    </YStack>
  );
}
