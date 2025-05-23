import { ContentCard } from "@/components/ContentCard";
import UserList from "@/components/UserList";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { useMaybeWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { fetchDocsByIds, useQuery } from "@/utils/firestore";
import { updateParticipants } from "@/utils/participantManagement";
import { findNearbyWalkers } from "@/utils/userSearch";
import { collection, query, where } from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Share2, Users } from "@tamagui/lucide-icons";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard } from "react-native";
import { Button, Spinner, Text, YStack } from "tamagui";
import { Friendship, UserData } from "walk2gether-shared";
import WizardWrapper from "./WizardWrapper";

interface InviteSelectionProps {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  walkId?: string; // Optional walkId for direct usage outside the wizard
  walkType?: "friends" | "neighborhood" | "meetup"; // Optional walkType for direct usage
  invitationCode?: string; // Optional invitationCode for direct usage outside the wizard
}

export const InviteSelection: React.FC<InviteSelectionProps> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
  walkId,
  walkType,
  invitationCode,
}) => {
  const walkFormContext = useMaybeWalkForm();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();

  // Use either the provided walkId or get it from the context
  const effectiveWalkId = walkId || walkFormContext!.createdWalkId;
  const effectiveWalkType = walkType || walkFormContext!.formData?.type;
  const effectiveInvitationCode =
    invitationCode || walkFormContext?.formData?.invitationCode;

  // State variables
  const [participantUids, setParticipantUids] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Using UserData & {id: string} instead of WithId<UserData> to avoid _ref requirement
  const [usersList, setUsersList] = useState<Array<UserData & { id: string }>>(
    []
  );

  // Check participants if we have a created walk ID
  const walkParticipantsCollection = effectiveWalkId
    ? collection(firestore_instance, `walks/${effectiveWalkId}/participants`)
    : undefined;
  const { docs: walkParticipants } = useQuery(walkParticipantsCollection);

  // Determine walk type
  const isNeighborhoodWalk = effectiveWalkType === "neighborhood";
  const isFriendsWalk = effectiveWalkType === "friends";

  // Determine if user can continue
  // Disable continue button while submitting
  const continueDisabled = isSubmitting;

  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery =
    user?.uid && isFriendsWalk
      ? query(
          collection(firestore_instance, "friendships"),
          where("uids", "array-contains", user.uid),
          where("deletedAt", "==", null)
        )
      : undefined;

  const { docs: friendships, status: friendshipsStatus } =
    useQuery<Friendship>(friendshipsQuery);

  // State for nearby users in neighborhood walks
  const [nearbyUserIds, setNearbyUserIds] = useState<string[]>([]);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);

  // Fetch nearby users for neighborhood walks
  useEffect(() => {
    if (!isNeighborhoodWalk || !userData) return;

    const fetchNearbyUsers = async () => {
      setIsLoadingNearbyUsers(true);
      try {
        const location = userData.location;
        if (!location || !location.latitude || !location.longitude) {
          showMessage(
            "Unable to find nearby users: location not available",
            "error"
          );
          return;
        }

        // Find users within 0.8km (approximately 1/2 mile)
        const { nearbyUserIds: userIds } = await findNearbyWalkers({
          user,
          userLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          radiusKm: 0.8,
        });

        setNearbyUserIds(userIds);

        // For neighborhood walks, automatically select all nearby users
        if (userIds.length > 0) {
          setParticipantUids(userIds);
        }
      } catch (error) {
        console.error("Error finding nearby users:", error);
        showMessage("Failed to find nearby users", "error");
      } finally {
        setIsLoadingNearbyUsers(false);
      }
    };

    fetchNearbyUsers();
  }, [isNeighborhoodWalk, userData, user]);

  // Load user data based on walk type
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      setIsLoadingUsers(true);

      try {
        if (isFriendsWalk && friendships) {
          // For friends walks, get friends' user data from friendships
          const friendUserIds = friendships
            .map((friendship) =>
              friendship.uids.find((uid) => uid !== user.uid)
            )
            .filter(Boolean) as string[];

          if (friendUserIds.length > 0) {
            // Use the fetchDocsByIds function to get all friend users at once
            const userDocs = await fetchDocsByIds<UserData>(
              "users",
              friendUserIds
            );
            setUsersList(userDocs as Array<UserData & { id: string }>);
          } else {
            setUsersList([]);
          }
        } else if (isNeighborhoodWalk && nearbyUserIds.length > 0) {
          // For neighborhood walks, filter out current user
          const filteredUserIds = nearbyUserIds.filter(
            (id: string) => id !== user.uid
          );

          if (filteredUserIds.length > 0) {
            // Use the fetchDocsByIds function to get all nearby users at once
            const userDocs = await fetchDocsByIds<UserData>(
              "users",
              filteredUserIds
            );
            setUsersList(userDocs as Array<UserData & { id: string }>);
          } else {
            setUsersList([]);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        showMessage("Failed to load users", "error");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isFriendsWalk, isNeighborhoodWalk, friendships, nearbyUserIds, user]);

  // Handle user selection/deselection
  const handleUserToggle = (user: UserData & { id: string }) => {
    setParticipantUids((prev) => {
      if (prev.includes(user.id)) {
        return prev.filter((id) => id !== user.id);
      } else {
        return [...prev, user.id];
      }
    });
  };

  // Generate and share the invitation link
  const getInvitationLink = () => {
    if (!userData?.friendInvitationCode || !effectiveInvitationCode) return "";

    return `https://projectwalk2gether.org/join?code=${userData.friendInvitationCode}&walk=${effectiveInvitationCode}`;
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

  const handleSubmit = async () => {
    // Should confirm and then show the next screen if all is well
    if (!effectiveWalkId || !userData) {
      showMessage(
        "Unable to update participants. Missing walk ID or user data.",
        "error"
      );
      return;
    }

    // Check if we should proceed to the next screen or show a confirmation
    const handleProceed = () => {
      if (participantUids.length === 0) {
        // Show a confirmation dialog if no users are selected
        Alert.alert(
          "No Participants Selected",
          isNeighborhoodWalk
            ? "Your walk will be visible to users in your area. You can also invite specific friends later."
            : "Are you sure you want to continue without inviting any friends?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Continue",
              onPress: submitParticipants,
            },
          ]
        );
      } else {
        // If users are selected, proceed directly
        submitParticipants();
      }
    };

    // Submit participants function to avoid duplicating code
    const submitParticipants = async () => {
      setIsSubmitting(true);

      try {
        // Update the participants collection with the selected user IDs
        await updateParticipants(
          effectiveWalkId as string,
          participantUids,
          userData
        );

        // Call the onContinue prop to advance to the next screen
        onContinue();
      } catch (error) {
        console.error("Error updating participants:", error);
        showMessage("Failed to update participants", "error");
      } finally {
        setIsSubmitting(false);
      }
    };

    handleProceed();
  };

  return (
    <LinearGradient
      flex={1}
      colors={["#f7fafc", "#e0e7ef"]}
      start={[0, 0]}
      end={[0, 1]}
    >
      <WizardWrapper
        onContinue={handleSubmit}
        onBack={onBack}
        continueText="Done"
        continueDisabled={continueDisabled}
        currentStep={currentStep}
        totalSteps={totalSteps}
      >
        <YStack flex={1} gap="$4">
          <YStack gap="$5">
            <ContentCard
              title={isNeighborhoodWalk ? "Select Neighbors" : "Select Friends"}
              icon={<Users size={20} color={COLORS.textOnLight} />}
              description={
                isNeighborhoodWalk
                  ? "Users in your area will be notified about your walk."
                  : "Choose friends to invite to your walk."
              }
            >
              {isLoadingUsers ? (
                <YStack alignItems="center" padding="$4">
                  <Spinner size="large" color="$blue10" />
                  <Text color={COLORS.textOnLight} marginTop="$2">
                    Loading friends...
                  </Text>
                </YStack>
              ) : (
                <>
                  <UserList
                    users={usersList}
                    onSelectUser={handleUserToggle}
                    searchEnabled={true}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedUserIds={participantUids}
                    emptyMessage={
                      isFriendsWalk
                        ? "You don't have any friends yet. Add friends to invite them."
                        : "Neighbors in your area will be automatically notified when you create a walk."
                    }
                  />
                  <Text
                    fontSize={16}
                    color={COLORS.textOnLight}
                    marginTop="$2"
                    textAlign="center"
                    fontWeight="600"
                    marginBottom="$2"
                  >
                    {isNeighborhoodWalk
                      ? isLoadingNearbyUsers
                        ? "Finding neighbors nearby..."
                        : participantUids.length > 0
                        ? `${participantUids.length} ${
                            participantUids.length === 1
                              ? "neighbor"
                              : "neighbors"
                          } will be notified`
                        : "No neighbors found in your area"
                      : `${participantUids.length} ${
                          participantUids.length === 1 ? "friend" : "friends"
                        } selected`}
                  </Text>

                  <YStack
                    alignItems="center"
                    marginTop="$4"
                    paddingBottom="$2"
                    gap="$4"
                  >
                    {usersList.length > 0 && !isNeighborhoodWalk && (
                      <Text fontSize={14} color="$gray10" fontWeight="500">
                        Don't see your friend here yet?
                      </Text>
                    )}
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
                      {isNeighborhoodWalk
                        ? "Invite another neighbor"
                        : "Invite a new friend to Walk2Gether"}
                    </Button>
                  </YStack>
                </>
              )}
            </ContentCard>
          </YStack>
        </YStack>
      </WizardWrapper>
    </LinearGradient>
  );
};

export default InviteSelection;
