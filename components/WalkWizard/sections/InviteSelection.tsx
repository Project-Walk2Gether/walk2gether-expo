import { ContentCard } from "@/components/ContentCard";
import { FormControl } from "@/components/FormControl";
import UserList from "@/components/UserList";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useFriends } from "@/context/FriendsContext";
import { useUserData } from "@/context/UserDataContext";
import { useMaybeWalkForm, useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { fetchDocsByIds } from "@/utils/firestore";
import { updateParticipants } from "@/utils/participantManagement";
import { findNearbyWalkers } from "@/utils/userSearch";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Check, Copy, QrCode, Share2, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Clipboard } from "react-native";
import { Button, Input, Spacer, Spinner, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, UserData, Walk, WithId } from "walk2gether-shared";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  walk: WithId<Walk>; // Required walk object
  // Keep these for backwards compatibility during migration
  walkId?: string;
  walkType?: "friends" | "neighborhood" | "meetup";
}

export const InviteSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
  walk,
  walkId,
  walkType,
}) => {
  const maybeWalkFormContext = useMaybeWalkForm();
  // Use form context for managing participantUids
  const { formData, updateFormData, closeWalkForm } = useWalkForm();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();
  const router = useRouter();

  // Use either the provided walk object or fallback to walkId and walkType for backwards compatibility
  const effectiveWalkId =
    walk?.id || (walkId || maybeWalkFormContext?.createdWalkId)!;
  const effectiveWalkType =
    walk?.type || (walkType || maybeWalkFormContext?.formData?.type)!;

  // Extract accepted user IDs from walk.participantsById
  const acceptedUserIds = useMemo(() => {
    if (!walk || !walk.participantsById) return [];
    return Object.entries(walk.participantsById)
      .filter(([_, participant]) => participant.acceptedAt !== null)
      .map(([userId]) => userId);
  }, [walk]);

  // State variables - no longer managing participantUids locally
  // Using participantUids from form state instead
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Using UserData & {id: string} instead of WithId<UserData> to avoid _ref requirement
  const [users, setUsers] = useState<WithId<UserData>[]>([]);

  // Determine walk type
  const isNeighborhoodWalk = effectiveWalkType === "neighborhood";
  const isFriendsWalk = effectiveWalkType === "friends";
  const isMeetupWalk = effectiveWalkType === "meetup";
  const { friendships } = useFriends();

  // Determine if user can continue
  // Disable continue button while submitting
  const continueDisabled = isSubmitting;

  // State for nearby users in neighborhood walks
  const [nearbyUserIds, setNearbyUserIds] = useState<string[]>([]);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);
  const [shareSuccessful, setShareSuccessful] = useState(false);
  const [copied, setCopied] = useState(false);

  // No need for custom functions to check invitation status
  // We'll pass the acceptedUserIds array to UserList instead

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
        const currentParticipants = formData.participantUids || [];
        const uniqueParticipants = new Set([...currentParticipants]);
        userIds.forEach((userId) => {
          if (userId !== user?.uid) {
            uniqueParticipants.add(userId);
          }
        });
        updateFormData({ participantUids: Array.from(uniqueParticipants) });
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
            setUsers(userDocs);
          } else {
            setUsers([]);
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
            setUsers(userDocs);
          } else {
            setUsers([]);
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

  // Memoized participant count message
  const getParticipantMessage = useMemo(() => {
    if (isNeighborhoodWalk) {
      if (isLoadingNearbyUsers) {
        return "Finding neighbors nearby...";
      } else if ((formData.participantUids?.length || 0) > 0) {
        return `${formData.participantUids?.length || 0} ${
          (formData.participantUids?.length || 0) === 1
            ? "neighbor"
            : "neighbors"
        } will be notified`;
      } else {
        return "No neighbors found in your area";
      }
    } else if (effectiveWalkType === "meetup") {
      return `${formData.participantUids?.length || 0} ${
        (formData.participantUids?.length || 0) === 1
          ? "participant"
          : "participants"
      } invited`;
    } else {
      return `${formData.participantUids?.length || 0} ${
        (formData.participantUids?.length || 0) === 1 ? "friend" : "friends"
      } selected`;
    }
  }, [
    isNeighborhoodWalk,
    isLoadingNearbyUsers,
    formData.participantUids?.length,
    effectiveWalkType,
  ]);

  // Handle user selection/deselection - updating form state instead of local state
  const handleUserToggle = (user: UserData & { id: string }) => {
    const currentUids = formData.participantUids || [];
    // Create updated list of participant UIDs
    const updatedUids = currentUids.includes(user.id)
      ? currentUids.filter((uid) => uid !== user.id) // Remove user if already selected
      : [...currentUids, user.id]; // Add user if not selected

    // Update form state
    updateFormData({ participantUids: updatedUids });
  };

  // Generate and share the invitation link
  const getInvitationLink = () => {
    // Need user's invitation code and walk ID to generate a valid link
    if (!userData?.friendInvitationCode)
      throw new Error("No friend invitation code available");

    // Properly encode URL parameters to prevent encoding issues
    const userCode = encodeURIComponent(userData.friendInvitationCode);

    // Use the walk ID directly as the walk parameter
    // This is more reliable than using the invitation code
    const inviteLink = `https://projectwalk2gether.org/join?code=${userCode}&walk=${effectiveWalkId}`;
    console.log("[InviteSelection] Generated invitation link:", inviteLink);
    console.log("[InviteSelection] Params:", {
      userCode,
      walkId: effectiveWalkId,
    });
    return inviteLink;
  };

  // Handle sharing the invitation link
  const handleShareLink = () => {
    const link = getInvitationLink();

    if (!link) {
      showMessage("Unable to generate invitation link", "error");
      return;
    }

    // Default message text that will be editable in the custom share screen
    let defaultMessage =
      "I've been using this walking app. You should check it out.";
    let title = "Invite friends to Walk2Gether";

    // Customize message based on walk type
    if (effectiveWalkType === "meetup") {
      defaultMessage = `Join me for a meetup walk to discuss "${
        (walk as MeetupWalk)?.topic || formData.topic || "our topic"
      }"! ${
        (walk as MeetupWalk)?.descriptionMarkdown ||
        formData.descriptionMarkdown
          ? "We'll be talking about interesting ideas together while walking."
          : ""
      }`;
      title = "Join my Walk2Gether Meetup";
    } else if (effectiveWalkType === "neighborhood") {
      defaultMessage =
        "I'm organizing a neighborhood walk. Join me for some fresh air and community connection!";
      title = "Join my Neighborhood Walk";
    } else {
      defaultMessage =
        "I've been using this walking app. You should check it out.";
      title = "Join my Walk2Gether Walk";
    }

    // Navigate to the custom share screen with necessary parameters
    router.push({
      pathname: "/(app)/(modals)/custom-share",
      params: {
        link: encodeURIComponent(link),
        defaultMessage: encodeURIComponent(defaultMessage),
        title: encodeURIComponent(title),
      },
    });

    // Track that the user shared the invitation
    setShareSuccessful(true);
  };

  const handleCancelButtonPress = () => {
    // Show confirmation dialog before canceling
    Alert.alert(
      effectiveWalkType === "meetup" ? "Cancel Meetup" : "Cancel Walk",
      effectiveWalkType === "meetup"
        ? "Are you sure you want to cancel this meetup? This action cannot be undone."
        : "Are you sure you want to cancel this walk? This action cannot be undone.",
      [
        {
          text:
            effectiveWalkType === "meetup"
              ? "No, Keep Meetup"
              : "No, Keep Walk",
          style: "cancel",
        },
        {
          text:
            effectiveWalkType === "meetup"
              ? "Yes, Cancel Meetup"
              : "Yes, Cancel Walk",
          style: "destructive",
          onPress: () => {
            // Delete the walk document if it exists
            if (walk?._ref) {
              walk._ref
                .delete()
                .then(() => {
                  // Close the entire walk form modal
                  closeWalkForm();
                })
                .catch((error: Error) => {
                  console.error("Error deleting walk:", error);
                  showMessage(
                    "Failed to cancel walk. Please try again.",
                    "error"
                  );
                });
            } else if (maybeWalkFormContext?.createdWalkId) {
              // If we have a createdWalkId but no walk object, try to delete using the ID
              firestore()
                .collection("walks")
                .doc(maybeWalkFormContext.createdWalkId)
                .delete()
                .then(() => {
                  closeWalkForm();
                })
                .catch((error: Error) => {
                  console.error("Error deleting walk:", error);
                  showMessage(
                    "Failed to cancel walk. Please try again.",
                    "error"
                  );
                });
            } else {
              // If no walk document exists yet, just close the form
              closeWalkForm();
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Should confirm and then update participants
    if (!effectiveWalkId || !userData) {
      showMessage(
        "Unable to update participants. Missing walk ID or user data.",
        "error"
      );
      return;
    }

    // Check if we should proceed to the next screen or show a confirmation
    const handleProceed = () => {
      if (
        formData.participantUids?.length === 0 &&
        !isMeetupWalk &&
        (friendships.length > 0 || nearbyUserIds.length > 0) &&
        !shareSuccessful
      ) {
        // Show a confirmation dialog if no users are selected
        Alert.alert(
          "No-one invited yet",
          isNeighborhoodWalk
            ? "Are you sure you want to continue without inviting any neighbors?"
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
        // Wrap the updateParticipants call in a try/catch to catch any synchronous errors
        try {
          // Update the participants collection with the selected user IDs
          await updateParticipants(
            effectiveWalkId as string,
            formData.participantUids || [],
            userData
          );
          console.log(
            "[InviteSelection] updateParticipants call completed successfully"
          );
        } catch (innerError) {
          console.error(
            "[InviteSelection] ERROR in updateParticipants call:",
            innerError
          );
          throw innerError; // Re-throw to be caught by outer try/catch
        }

        console.log(
          "[InviteSelection] updateParticipants successful, calling onContinue"
        );

        // Call the onContinue prop to advance to the next screen
        onContinue();
      } catch (error) {
        console.error("[InviteSelection] ERROR in submission process:", error);
        console.error(
          "[InviteSelection] Error details:",
          error?.toString ? error.toString() : JSON.stringify(error)
        );
        showMessage(
          "Failed to update participants. Please try again.",
          "error"
        );
      } finally {
        console.log("[InviteSelection] Setting isSubmitting to false");
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
        <YStack flex={1} gap="$3">
          <ContentCard
            title={
              isNeighborhoodWalk
                ? "Select Neighbors"
                : effectiveWalkType === "meetup"
                ? "Invite Participants"
                : "Select Friends"
            }
            icon={<Users size={20} color={COLORS.textOnLight} />}
            description={
              isNeighborhoodWalk
                ? "Walk2Gether neighbors in your area will be notified about your walk."
                : effectiveWalkType === "meetup"
                ? "Invite people to join your meetup walk discussion."
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
                  users={users}
                  onSelectUser={handleUserToggle}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedUserIds={formData.participantUids || []}
                  acceptedUserIds={acceptedUserIds}
                  emptyMessage={
                    isFriendsWalk
                      ? "Your friends aren't on Walk2Gether yet. Add friends to invite them to your walk."
                      : effectiveWalkType === "meetup"
                      ? undefined
                      : "Neighbors in your area will be automatically notified when you create a walk."
                  }
                />
                {users.length > 0 && (
                  <Text
                    fontSize={16}
                    color={COLORS.textOnLight}
                    marginTop="$2"
                    textAlign="center"
                    fontWeight="600"
                    marginBottom="$2"
                  >
                    {getParticipantMessage}
                  </Text>
                )}

                {!isNeighborhoodWalk && (
                  <YStack marginTop="$4" paddingBottom="$2" gap="$4">
                    {effectiveWalkType === "meetup" ? null : (
                      <Text fontSize={14} color="$gray10" fontWeight="500">
                        Don't see your friend here yet?
                      </Text>
                    )}

                    {effectiveWalkType === "meetup" && (
                      <YStack mb="$4" gap="$2">
                        <Text fontSize={14} color="$gray11" fontWeight="500">
                          Meetup invitation link:
                        </Text>
                        <XStack
                          backgroundColor="$background"
                          borderRadius={8}
                          borderColor="$borderColor"
                          borderWidth={1}
                          alignItems="center"
                          gap="$2"
                        >
                          <Input
                            flex={1}
                            value={getInvitationLink()}
                            editable={false}
                            fontSize={12}
                          />
                          <Button
                            size="$3"
                            color={COLORS.textOnDark}
                            backgroundColor={
                              copied ? COLORS.success : COLORS.primary
                            }
                            onPress={() => {
                              Clipboard.setString(getInvitationLink());
                              setCopied(true);
                              showMessage(
                                "Invitation link copied to clipboard",
                                "success"
                              );
                              // Reset copied state after 2 seconds
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            icon={
                              copied ? (
                                <Check size={16} color="#fff" />
                              ) : (
                                <Copy size={16} color="#fff" />
                              )
                            }
                          >
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                        </XStack>
                        <Text fontSize={12} color="$gray10" marginTop="$1">
                          Tap to copy the link and share it with others
                        </Text>
                      </YStack>
                    )}

                    <FormControl
                      label={
                        effectiveWalkType === "meetup"
                          ? "Invite participants"
                          : "Invite a new friend"
                      }
                    >
                      <XStack gap="$3" width="100%" alignItems="center">
                        <Button
                          backgroundColor={COLORS.primary}
                          color={COLORS.textOnDark}
                          onPress={handleShareLink}
                          size="$4"
                          flex={1}
                          icon={<Share2 size={18} color="#fff" />}
                          paddingHorizontal={16}
                          borderRadius={8}
                          hoverStyle={{ backgroundColor: "#6d4c2b" }}
                          pressStyle={{ backgroundColor: "#4b2e13" }}
                        >
                          {isNeighborhoodWalk
                            ? "Invite another neighbor"
                            : effectiveWalkType === "meetup"
                            ? "Share invitation"
                            : "Send invitation"}
                        </Button>

                        <Button
                          backgroundColor={COLORS.secondary}
                          color={COLORS.textOnDark}
                          onPress={() =>
                            router.push({
                              pathname: "/qr-code",
                              params: { walkCode: effectiveWalkId },
                            })
                          }
                          size="$4"
                          icon={<QrCode size={18} color="#fff" />}
                          paddingHorizontal={16}
                          borderRadius={8}
                          hoverStyle={{ backgroundColor: "#4a95c4" }}
                          pressStyle={{ backgroundColor: "#2d7fb3" }}
                        >
                          QR code
                        </Button>
                      </XStack>
                    </FormControl>
                  </YStack>
                )}
              </>
            )}
          </ContentCard>

          <Spacer flexGrow={1} />
          <Button onPress={handleCancelButtonPress} theme={"red"}>
            {effectiveWalkType === "meetup"
              ? "Cancel this meetup"
              : "I changed my mind - cancel the walk"}
          </Button>
        </YStack>
      </WizardWrapper>
    </LinearGradient>
  );
};

export default InviteSelection;
