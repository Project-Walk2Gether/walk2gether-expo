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
  const isPhone = invitation.type === "phone";
  return (
    <Card
      bordered
      my="$2"
      p={isPhone ? "$3.5" : "$3"}
      bg={isPhone ? "$gray2" : undefined}
      borderRadius={isPhone ? "$8" : "$6"}
      elevate={isPhone ? 2 : 1}
      borderColor={isPhone ? "$gray5" : undefined}
      shadowColor={isPhone ? "$gray8" : undefined}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$3">
          <Ionicons
            name={isPhone ? "call" : "person"}
            size={22}
            color={isPhone ? "#34A853" : "#4285F4"}
            style={{ marginRight: 2 }}
          />
          {isPhone ? (
            <Text fontWeight="700" fontSize="$6">
              {invitation.recipientPhoneNumber}
            </Text>
          ) : (
            <Text>{invitation.name}</Text>
          )}
        </XStack>
        <XStack>
          <Card
            pressable
            bg={isPhone ? "$red3" : "$gray3"}
            hoverStyle={{ bg: isPhone ? "$red5" : "$gray5" }}
            borderRadius={100}
            p={2}
            onPress={() => onRemove(invitation.id)}
            ai="center"
            jc="center"
            w={32}
            h={32}
            elevation={isPhone ? 4 : 2}
          >
            <Ionicons name="close" size={20} color={isPhone ? "#fff" : "#777"} />
          </Card>
        </XStack>
      </XStack>
    </Card>
  );
}
