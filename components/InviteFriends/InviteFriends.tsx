import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { Button, Card, Input, Text, YStack } from "tamagui";
import { Invitation, InvitationCard } from "../../components/InvitationCard";

// Re-export the Invitation type from InvitationCard
export type { Invitation };

type InviteFriendsProps = {
  invitations: Invitation[];
  onAddPhoneInvitation: (name: string, phoneNumber: string) => void;
  onRemoveInvitation: (id: string) => void;
  disableAddButton?: boolean;
};

export default function InviteFriends({
  invitations,
  onAddPhoneInvitation,
  onRemoveInvitation,
  disableAddButton = false,
}: InviteFriendsProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");

  // Handle phone invitation submission
  const handleAddPhoneInvitation = () => {
    if (!phoneNumber || !name) return;

    onAddPhoneInvitation(name, phoneNumber);

    // Clear input fields
    setPhoneNumber("");
    setName("");
  };

  // Render invitation using the InvitationCard component
  const renderInvitation = ({ item }: { item: Invitation }) => (
    <InvitationCard invitation={item} onRemove={onRemoveInvitation} />
  );

  return (
    <YStack gap="$4">
      {/* Hide the entire card when there's already an invitation and disableAddButton is true */}
      {!(disableAddButton && invitations.length > 0) && (
        <Card bordered p="$4" gap="$2">
          <YStack gap="$3" pt="$2">
            <Input placeholder="Name" value={name} onChangeText={setName} />
            <Input
              placeholder="Phone Number"
              value={phoneNumber}
              color={COLORS.text}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <Button
              onPress={handleAddPhoneInvitation}
              disabled={!phoneNumber || !name || disableAddButton}
              icon={<Ionicons name="add-circle-outline" size={20} />}
            >
              Add another friend
            </Button>
          </YStack>
        </Card>
      )}

      <YStack gap="$2">
        {invitations.length === 0 ? null : (
          <>
            <Text fontSize="$5" fontWeight="bold">
              Ready to send
            </Text>
            <FlatList
              data={invitations}
              renderItem={renderInvitation}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}
      </YStack>
    </YStack>
  );
}
