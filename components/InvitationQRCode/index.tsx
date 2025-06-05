import React from "react";
import QRCode from "react-native-qrcode-svg";

interface Props {
  invitationCode?: string;
  walkCode?: string;
  size?: number;
  showText?: boolean;
}

export const getInvitationUrl = (code?: string, walkCode?: string): string => {
  if (!code) return "";
  
  let url = `https://projectwalk2gether.org/join?code=${code}`;
  if (walkCode) {
    url += `&walk=${walkCode}`;
  }
  return url;
};

export default function InvitationQRCode({
  invitationCode,
  walkCode,
  size = 260,
  showText = false,
}: Props) {
  const url = getInvitationUrl(invitationCode, walkCode);

  if (!invitationCode) {
    return null;
  }

  return (
    <QRCode value={url} size={size} backgroundColor="#fff" color="#5A4430" />
  );
}
