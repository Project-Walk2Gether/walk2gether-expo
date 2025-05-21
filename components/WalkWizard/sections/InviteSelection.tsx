import { ContentCard } from "@/components/ContentCard";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import { collection, query, where } from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Link, MapPin, Share2, Users } from "@tamagui/lucide-icons";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { Clipboard } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { Friendship } from "walk2gether-shared";
import FriendsList from "../../FriendsList";
import WizardWrapper from "./WizardWrapper";

interface InviteSelectionProps {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const InviteSelection: React.FC<InviteSelectionProps> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();
  const [selectedFriends, setSelectedFriends] = useState<string[]>(
    formData.invitedUserIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);
  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = user?.uid
    ? query(
        collection(firestore_instance, "friendships"),
        where("uids", "array-contains", user.uid),
        where("deletedAt", "==", null)
      )
    : undefined;

  const { docs: friendships } = useQuery<Friendship>(friendshipsQuery);

  // Determine if user has any friends
  const hasFriends = friendships && friendships.length > 0;
  const isNeighborhoodWalk = formData.type === "neighborhood";
  const isFriendsWalk = formData.type === "friends";

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
    console.log({ userData, formData });
    if (!userData?.friendInvitationCode || !formData.invitationCode) return "";

    return `https://projectwalk2gether.org/join?code=${userData.friendInvitationCode}&walk=${formData.invitationCode}`;
  };

  // Handle sharing the invitation link
  const handleShareLink = async () => {
    const link = getInvitationLink();
    if (!link) {
      showMessage("Unable to generate invitation link", "error");
      return;
    }

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(link, {
          dialogTitle: "Invite friends to walk",
          mimeType: "text/plain",
          UTI: "public.plain-text",
        });
        
        // Mark invitation as sent
        setInvitationSent(true);
        showMessage("Invitation link shared successfully", "success");
      } else {
        // Fallback for web or devices where Sharing is not available
        Clipboard.setString(link);
        showMessage("Invitation link copied to clipboard", "success");
        
        // Mark invitation as sent
        setInvitationSent(true);
      }
    } catch (error) {
      console.error("Error sharing link:", error);
      showMessage("Could not share the invitation link", "error");
    }
  };

  const handleContinue = () => {
    onContinue();
  };

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
        continueText="Done"
        continueDisabled={!invitationSent}
        currentStep={currentStep}
        totalSteps={totalSteps}
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
                  We'll invite users within a 1/2 mile radius of your location
                  to join your walk. This is a great way to meet neighbors and
                  make new walking buddies!
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
                  <Text
                    fontSize={16}
                    color={COLORS.textOnLight}
                    marginTop="$2"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {selectedFriends.length}{" "}
                    {selectedFriends.length === 1 ? "friend" : "friends"}{" "}
                    selected
                  </Text>
                </ContentCard>
              ) : null}

              <ContentCard
                title="Invite new friend"
                icon={<Link size={20} color={COLORS.textOnLight} />}
                description="Send an invitation for your friend to download the Walk2Gether app to join the walk."
              >
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
                  Send Invitation
                </Button>
              </ContentCard>
            </YStack>
          )}
        </YStack>
      </WizardWrapper>
    </LinearGradient>
  );
};

export default InviteSelection;
