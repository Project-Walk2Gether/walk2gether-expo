import { ContentCard } from "@/components/ContentCard";
import UserList from "@/components/UserList";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { fetchDocsByIds, useQuery } from "@/utils/firestore";
import { updateParticipants } from "@/utils/participantManagement";
import { collection, query, where } from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Link, MapPin, Share2, Users } from "@tamagui/lucide-icons";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard } from "react-native";
import { Button, Card, Spinner, Text, XStack, YStack } from "tamagui";
import { Friendship, UserData, WithId } from "walk2gether-shared";
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
  const { formData, updateFormData, createdWalkId } = useWalkForm();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();
  
  // State variables
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Using UserData & {id: string} instead of WithId<UserData> to avoid _ref requirement
  const [usersList, setUsersList] = useState<Array<UserData & {id: string}>>([]);
  
  // Check participants if we have a created walk ID
  const walkParticipantsCollection = createdWalkId
    ? collection(firestore_instance, `walks/${createdWalkId}/participants`)
    : undefined;
  const { docs: walkParticipants } = useQuery(walkParticipantsCollection);
  
  // Determine walk type
  const isNeighborhoodWalk = formData.type === "neighborhood";
  const isFriendsWalk = formData.type === "friends";
  
  // Determine if user can continue
  // Disable continue button while submitting
  const continueDisabled = isSubmitting;
  
  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = user?.uid && isFriendsWalk
    ? query(
        collection(firestore_instance, "friendships"),
        where("uids", "array-contains", user.uid),
        where("deletedAt", "==", null)
      )
    : undefined;

  const { docs: friendships, status: friendshipsStatus } = useQuery<Friendship>(friendshipsQuery);
  
  // For neighborhood walks, we'll fetch nearby users when rebuilding this functionality
  const nearbyUserIds: string[] = [];

  // Load user data based on walk type
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setIsLoadingUsers(true);
      
      try {
        if (isFriendsWalk && friendships) {
          // For friends walks, get friends' user data from friendships
          const friendUserIds = friendships
            .map(friendship => friendship.uids.find(uid => uid !== user.uid))
            .filter(Boolean) as string[];
            
          if (friendUserIds.length > 0) {
            // Use the new fetchDocsByIds function to get all friend users at once
            const userDocs = await fetchDocsByIds<UserData>('users', friendUserIds);
            setUsersList(userDocs as Array<UserData & {id: string}>);
          } else {
            setUsersList([]);
          }
        } else if (isNeighborhoodWalk && nearbyUserIds.length > 0) {
          // For neighborhood walks, filter out current user
          const filteredUserIds = nearbyUserIds.filter((id: string) => id !== user.uid);
          
          if (filteredUserIds.length > 0) {
            // Use the new fetchDocsByIds function to get all nearby users at once
            const userDocs = await fetchDocsByIds<UserData>('users', filteredUserIds);
            setUsersList(userDocs as Array<UserData & {id: string}>);
          } else {
            setUsersList([]);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        showMessage('Failed to load users', 'error');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [isFriendsWalk, isNeighborhoodWalk, friendships, nearbyUserIds, user]);

  // Handle user selection/deselection
  const handleUserToggle = (user: UserData & {id: string}) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(user.id)) {
        return prev.filter((id) => id !== user.id);
      } else {
        return [...prev, user.id];
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

        // Success - link has been shared
      } else {
        // Fallback for web or devices where Sharing is not available
        Clipboard.setString(link);
        showMessage("Invitation link copied to clipboard", "success");
        
        // Success - link has been copied to clipboard
      }
    } catch (error) {
      console.error("Error sharing link:", error);
      showMessage("Could not share the invitation link", "error");
    }
  };

  const handleContinue = async () => {
    if (!createdWalkId || !userData) {
      showMessage("Unable to update participants. Missing walk ID or user data.", "error");
      return;
    }
    
    // If no participants are selected, show a confirmation dialog
    if (selectedUserIds.length === 0) {
      const confirmationMessage = isFriendsWalk
        ? "You haven't invited any friends yet. Are you sure you're done?"
        : "There are no walk2gether members in the neighborhood. Do you want to continue?";
      
      Alert.alert(
        "Confirm", 
        confirmationMessage,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Continue",
            onPress: () => submitParticipants()
          }
        ]
      );
      return;
    }
    
    // If participants are selected, proceed directly
    submitParticipants();
  };
  
  // Submit participants function to avoid duplicating code
  const submitParticipants = async () => {
    setIsSubmitting(true);
    
    try {
      // Update participants based on the selected user IDs
      await updateParticipants(
        createdWalkId!,
        selectedUserIds,
        userData!,
        "invited"
      );
      
      showMessage("Participants updated successfully", "success");
      
      // Move to the next step
      onContinue();
    } catch (error) {
      console.error("Error updating participants:", error);
      showMessage("Failed to update participants", "error");
    } finally {
      setIsSubmitting(false);
    }
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
        continueDisabled={continueDisabled}
        currentStep={currentStep}
        totalSteps={totalSteps}
      >
        <YStack flex={1} gap="$4">
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
              <ContentCard
                title="Select Friends"
                icon={<Users size={20} color={COLORS.textOnLight} />}
                description="Choose friends to invite to your walk."
              >
                {isLoadingUsers ? (
                  <YStack alignItems="center" padding="$4">
                    <Spinner size="large" color="$blue10" />
                    <Text color={COLORS.textOnLight} marginTop="$2">Loading friends...</Text>
                  </YStack>
                ) : (
                  <>
                    <UserList
                      users={usersList}
                      onSelectUser={handleUserToggle}
                      searchEnabled={true}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedUserIds={selectedUserIds}
                      emptyMessage={isFriendsWalk ? "You don't have any friends yet. Add friends to invite them." : "No nearby users found."}
                    />
                    <Text
                      fontSize={16}
                      color={COLORS.textOnLight}
                      marginTop="$2"
                      textAlign="center"
                      fontWeight="600"
                    >
                      {selectedUserIds.length}{" "}
                      {selectedUserIds.length === 1 ? "user" : "users"}{" "}
                      selected
                    </Text>
                  </>
                )}
              </ContentCard>

              <ContentCard
                title={isNeighborhoodWalk ? "Invite more users" : "Invite new friend"}
                icon={<Link size={20} color={COLORS.textOnLight} />}
                description={isNeighborhoodWalk ? "Send an invitation to have more people join your neighborhood walk." : "Send an invitation for your friend to download the Walk2Gether app to join the walk."}
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
