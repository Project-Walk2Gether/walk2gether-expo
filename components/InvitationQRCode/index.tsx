import React from "react";
import QRCode from "react-native-qrcode-svg";

interface Props {
  invitationCode?: string;
  size?: number;
}

export const getInvitationUrl = (code?: string): string => {
  return code ? `https://projectwalk2gether.org/join?code=${code}` : "";
};

export default function InvitationQRCode({
  invitationCode,
  size = 260,
}: Props) {
  const url = getInvitationUrl(invitationCode);

  if (!invitationCode) {
    return null;
  }

  return (
    <QRCode value={url} size={size} backgroundColor="#fff" color="#5A4430" />
  );
}
