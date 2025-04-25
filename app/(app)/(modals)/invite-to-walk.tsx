import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Separator, Text, YStack } from "tamagui";
import { findUndefined } from "walk2gether-shared";
import FriendsList from "../../../components/FriendsList";
import HeaderBackButton from "../../../components/HeaderBackButton";
import InviteFriends, { Invitation } from "../../../components/InviteFriends";
import { useAuth } from "../../../context/AuthContext";
import { useWalks } from "../../../context/WalksContext";
import { saveInvitations } from "../../../services/invitationsService";

export default function InviteToWalkScreen() {
  const router = useRouter();
  const { walkId } = useLocalSearchParams<{ walkId: string }>();
  const { user } = useAuth();
  const { getWalkById } = useWalks();
  const insets = useSafeAreaInsets();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [walkDetails, setWalkDetails] = useState<any>(null);

  // Fetch walk details
  useEffect(() => {
    if (walkId) {
      const walk = getWalkById(walkId);
      setWalkDetails(walk);
    }
  }, [walkId, getWalkById]);

  // Add a friend to invitation list
  const addFriendInvitation = (friend: any) => {
    setInvitations((prev) => {
      // Check if already in the list
      if (prev.some((inv) => inv.recipientUserId === friend.id)) {
        return prev;
      }

      // For friend walks, we should only have one invitation
      if (walkDetails?.type === "friend") {
        // Replace any existing invitations with this one
        return [
          {
            id: Date.now().toString(), // Generate a temporary ID
            recipientUserId: friend.id,
            name: friend.name,
            type: "friend",
          },
        ];
      }

      // For other walk types, add to the existing list
      return [
        ...prev,
        {
          id: Date.now().toString(), // Generate a temporary ID
          recipientUserId: friend.id,
          name: friend.name,
          type: "friend",
        },
      ];
    });
  };

  // Add a phone number invitation
  const addPhoneInvitation = (name: string, phoneNumber: string) => {
    setInvitations((prev) => {
      // Check if phone number already exists
      if (prev.some((inv) => inv.recipientPhoneNumber === phoneNumber)) {
        return prev;
      }

      // For friend walks, we should only have one invitation
      if (walkDetails?.type === "friend") {
        // Replace any existing invitations with this one
        return [
          {
            id: Date.now().toString(),
            recipientPhoneNumber: phoneNumber,
            name: name,
            type: "phone",
          },
        ];
      }

      // For other walk types, add to the existing list
      return [
        ...prev,
        {
          id: Date.now().toString(),
          recipientPhoneNumber: phoneNumber,
          name: name,
          type: "phone",
        },
      ];
    });
  };

  // Remove invitation
  const removeInvitation = (id: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  };

  // Send all invitations
  const sendInvitations = async () => {
    if (!user || !walkId) return;

    setLoading(true);

    console.log({ invitations });
    findUndefined(invitations);

    try {
      // Save invitations using our invitationsService, passing the walkId
      const savedIds = await saveInvitations(invitations, user.uid, walkId);

      console.log(
        `Successfully saved ${savedIds.length} invitations to walk ${walkId}`
      );

      // For phone invitations, we would send an SMS here in a real app
      const phoneInvites = invitations.filter((inv) => inv.type === "phone");
      if (phoneInvites.length > 0) {
        console.log(
          `Would send SMS to ${phoneInvites.length} recipients for walk invitation`
        );
      }

      // Navigate back to the home screen
      router.replace("/(app)/(tabs)");
    } catch (error) {
      console.error("Error sending invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Custom back button handler
  const handleBackPress = useCallback(() => {
    // Just go back to the home screen
    router.replace("/(app)/(tabs)");
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Invite to Walk",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        pt={insets.top}
        f={1}
        p="$4"
      >
        <YStack gap="$4">
          {walkDetails && (
            <Card
              bordered
              elevate
              size="$4"
              backgroundColor="$backgroundStrong"
            >
              <Card.Header padded>
                <YStack>
                  <Text fontSize="$6" fontWeight="bold">
                    {walkDetails.type === "friend"
                      ? "Friend Walk"
                      : "Friend Group Walk"}
                  </Text>
                  <Text fontSize="$3" color="$gray10">
                    {walkDetails.location?.name || "Location not specified"}
                  </Text>
                  {walkDetails.type === "friend" && (
                    <Text fontSize="$3" color="$orange10" mt="$2">
                      Note: Friend walks allow only one invitation
                    </Text>
                  )}
                </YStack>
              </Card.Header>
            </Card>
          )}

          <InviteFriends
            invitations={invitations}
            onAddPhoneInvitation={addPhoneInvitation}
            onRemoveInvitation={removeInvitation}
            disableAddButton={
              walkDetails?.type === "friend" && invitations.length > 0
            }
          />

          {/* Hide the friends list completely when there's already an invitation for friend walks */}
          {!(walkDetails?.type === "friend" && invitations.length > 0) && (
            <FriendsList
              onSelectFriend={addFriendInvitation}
              title="Choose friends to invite"
            />
          )}

          <Separator />

          <Button
            size="$5"
            theme="active"
            onPress={sendInvitations}
            disabled={invitations.length === 0 || loading}
            icon={<Ionicons name="paper-plane-outline" size={20} />}
          >
            {loading ? "Sending Invitations..." : "Send Invitations"}
          </Button>

          <Button
            size="$4"
            theme="gray"
            onPress={handleBackPress}
            icon={<Ionicons name="close-outline" size={20} />}
          >
            Skip Invitations
          </Button>
        </YStack>
      </ScrollView>
    </>
  );
}
