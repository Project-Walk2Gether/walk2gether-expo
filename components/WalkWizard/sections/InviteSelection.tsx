import { ContentCard } from "@/components/ContentCard";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import { collection, query, where } from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import {
  Copy,
  Link,
  MapPin,
  MessageCircle,
  Share2,
  Users
} from "@tamagui/lucide-icons";
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Clipboard, Platform } from "react-native";
import MapView from "react-native-maps";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { Friendship } from "walk2gether-shared";
import FriendsList from "../../FriendsList";
import WizardWrapper from "./WizardWrapper";

interface InviteSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}



export const InviteSelection: React.FC<InviteSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const { user } = useAuth();
  const { userData } = useUserData();
  const [selectedFriends, setSelectedFriends] = useState<string[]>(
    formData.invitedUserIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [shareLink, setShareLink] = useState("");
  const mapRef = useRef<MapView>(null);

  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = user?.uid
    ? query(
        collection(firestore_instance, "friendships"),
        where("uids", "array-contains", user.uid),
        where("deletedAt", "==", null)
      )
    : undefined;

  const { docs: friendships, status } = useQuery<Friendship>(friendshipsQuery);
  const loadingFriends = status === "loading";

  // Determine if user has any friends
  const hasFriends = friendships && friendships.length > 0;

  const isNeighborhoodWalk = formData.walkType === "neighborhood";
  const isFriendsWalk = formData.walkType === "friends";

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        const updated = prev.filter((id) => id !== friendId);
        updateFormData({ invitedUserIds: updated });
        return updated;
      } else {
        const updated = [...prev, friendId];
        updateFormData({ invitedUserIds: updated });
        return updated;
      }
    });
  };

  // Generate and share the invitation link
  const getInvitationLink = () => {
    if (!userData?.friendInvitationCode || !formData.invitationCode) return "";
    
    return `https://projectwalk2gether.org/join?code=${userData.friendInvitationCode}&walk=${formData.invitationCode}`;
  };
  
  // Handle sharing the invitation link
  const handleShareLink = async () => {
    const link = getInvitationLink();
    if (!link) {
      Alert.alert("Error", "Unable to generate invitation link");
      return;
    }
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(link, {
          dialogTitle: "Invite friends to walk",
          mimeType: "text/plain",
          UTI: "public.plain-text"
        });
      } else {
        // Fallback for web or devices where Sharing is not available
        Clipboard.setString(link);
        Alert.alert("Link copied", "Invitation link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing link:", error);
      Alert.alert("Error", "Could not share the invitation link");
    }
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    const link = getInvitationLink();
    if (!link) {
      Alert.alert("Error", "Unable to generate invitation link");
      return;
    }
    
    Clipboard.setString(link);
    Alert.alert("Success", "Invitation link copied to clipboard");
  };

  const handleContinue = () => {
    // For neighborhood walks, always allow continuing
    // For friend walks, ensure at least one friend is selected
    if (isNeighborhoodWalk || selectedFriends.length > 0) {
      onContinue();
    }
  };

  // Update the map when showing the neighborhood view
  useEffect(() => {
    if (isNeighborhoodWalk && formData.location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  }, [isNeighborhoodWalk, formData.location]);

  return (
    <LinearGradient
      flex={1}
      colors={["#f7fafc", "#e0e7ef"]}
      start={[0, 0]}
      end={[0, 1]}
    >
      <WizardWrapper
        onContinue={handleContinue}
        onBack={onBack}
        continueDisabled={
          !isNeighborhoodWalk &&
          selectedFriends.length === 0
        }
        continueText="Next"
      >
        <YStack flex={1} gap="$4" paddingHorizontal="$2" paddingVertical="$4">
          {isNeighborhoodWalk && (
            <YStack gap="$4">
              <Card
                elevate
                backgroundColor="#fff"
                borderRadius={20}
                padding="$5"
                shadowColor="#000"
                shadowOpacity={0.07}
                shadowRadius={7}
                shadowOffset={{ width: 0, height: 3 }}
              >
                <XStack alignItems="center" gap="$2" marginBottom="$2">
                  <MapPin size={22} color={COLORS.text} />
                  <Text fontSize={19} fontWeight="bold" color={COLORS.text}>
                    Neighborhood Walk
                  </Text>
                </XStack>
                <Text fontSize={16} color={COLORS.text} lineHeight={22}>
                  We'll invite users within a 1-mile radius of your location to
                  join your walk. This is a great way to meet neighbors and make
                  new walking buddies!
                </Text>
              </Card>
            </YStack>
          )}

          {isFriendsWalk && (
            <YStack gap="$5">
              {hasFriends ? (
                <ContentCard
                  title="Select Friends"
                  icon={<Users size={20} color={COLORS.textOnLight} />}
                  description="Choose friends to invite to your walk."
                >
                  <FriendsList
                    onSelectFriend={(friend) => handleFriendToggle(friend.id)}
                    searchEnabled={true}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedFriendIds={selectedFriends}
                  />
                </ContentCard>
              ) : null}

                  <ContentCard
                title="Invite friends"
                icon={<Link size={20} color={COLORS.textOnLight} />}
                description="Share an invitation link with friends to join your walk."
              >
                <YStack gap="$3">
                  <Text color={COLORS.textSecondary} fontSize={14}>
                    Share this link with friends to invite them to your walk. They'll be able to join directly by clicking on it.
                  </Text>
                  
                  <XStack gap="$3" justifyContent="center">
                    <Button
                      backgroundColor={COLORS.primary}
                      color={COLORS.textOnDark}
                      onPress={handleShareLink}
                      size="$4"
                      icon={<Share2 size={18} color="#fff" />}
                      paddingHorizontal={16}
                      borderRadius={8}
                      hoverStyle={{ backgroundColor: "#6d4c2b" }}
                      pressStyle={{ backgroundColor: "#4b2e13" }}
                    >
                      Share Link
                    </Button>
                    
                    <Button
                      backgroundColor={COLORS.subtle}
                      color={COLORS.text}
                      onPress={copyLinkToClipboard}
                      size="$4"
                      icon={<Copy size={18} color={COLORS.text} />}
                      paddingHorizontal={16}
                      borderRadius={8}
                    >
                      Copy Link
                    </Button>
                  </XStack>
                </YStack>
              </ContentCard>

              <Text
                fontSize={16}
                color={COLORS.textOnLight}
                marginTop="$2"
                textAlign="center"
                fontWeight="600"
              >
                {selectedFriends.length}{" "}
                {selectedFriends.length === 1 ? "friend" : "friends"} selected
              </Text>
            </YStack>
          )}
        </YStack>
      </WizardWrapper>
    </LinearGradient>
  );
};

export default InviteSelection;
