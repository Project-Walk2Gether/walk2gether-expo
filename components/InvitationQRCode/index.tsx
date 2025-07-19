import { getInvitationUrl } from "@/utils/invites";
import React from "react";
import QRCode from "react-native-qrcode-svg";

interface Props {
  invitationCode?: string;
  walkCode?: string;
  size?: number;
}

export default function InvitationQRCode({
  invitationCode,
  walkCode,
  size = 260,
}: Props) {
  const url = getInvitationUrl(invitationCode, walkCode);

  if (!invitationCode) {
    return null;
  }

  return (
    <QRCode value={url} size={size} backgroundColor="#fff" color="#5A4430" />
  );
}
