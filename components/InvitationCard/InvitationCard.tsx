import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Card, Text, XStack } from "tamagui";

export interface Invitation {
  id: string;
  type: "friend" | "phone";
  name: string;
  recipientUserId?: string;
  recipientPhoneNumber?: string;
}

interface InvitationCardProps {
  invitation: Invitation;
  onRemove: (id: string) => void;
}

export function InvitationCard({ invitation, onRemove }: InvitationCardProps) {
  return (
    <Card bordered my="$2" p="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Ionicons
            name={invitation.type === "friend" ? "person" : "call"}
            size={20}
            color={invitation.type === "friend" ? "#4285F4" : "#34A853"}
          />
          <Text>{invitation.name}</Text>
          {invitation.type === "phone" && (
            <Text color="$gray10">{invitation.recipientPhoneNumber}</Text>
          )}
        </XStack>
        <TouchableOpacity onPress={() => onRemove(invitation.id)}>
          <Ionicons name="close-circle" size={20} color="#777" />
        </TouchableOpacity>
      </XStack>
    </Card>
  );
}
