import { ContentCard } from "@/components/ContentCard";
import { FormControl } from "@/components/FormControl";
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
import { QrCode, Share2, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";
import { Friendship, UserData, Walk, WithId } from "walk2gether-shared";
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

  // State variables
  // Initialize participantUids with the keys from walk.participantsById
  const [participantUids, setParticipantUids] = useState<string[]>(() => {
    if (!walk || !walk.participantsById) return [];
    return Object.keys(walk.participantsById);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Using UserData & {id: string} instead of WithId<UserData> to avoid _ref requirement
  const [users, setUsers] = useState<WithId<UserData>[]>([]);

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

  const { docs: friendships } = useQuery<Friendship>(friendshipsQuery);

  // State for nearby users in neighborhood walks
  const [nearbyUserIds, setNearbyUserIds] = useState<string[]>([]);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);
  const [shareSuccessful, setShareSuccessful] = useState(false);

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
      } else if (participantUids.length > 0) {
        return `${participantUids.length} ${
          participantUids.length === 1 ? "neighbor" : "neighbors"
        } will be notified`;
      } else {
        return "No neighbors found in your area";
      }
    } else {
      return `${participantUids.length} ${
        participantUids.length === 1 ? "friend" : "friends"
      } selected`;
    }
  }, [isNeighborhoodWalk, isLoadingNearbyUsers, participantUids.length]);

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
    const defaultMessage = "I am using the Walk2Gether app to organize my walk. You should check it out.";
    const title = "Invite friends to Walk2Gether";

    // Navigate to the custom share screen with necessary parameters
    router.push({
      pathname: "/(app)/(modals)/custom-share",
      params: {
        link: encodeURIComponent(link),
        defaultMessage: encodeURIComponent(defaultMessage),
        title: encodeURIComponent(title)
      }
    });

    // Track that the user shared the invitation
    setShareSuccessful(true);
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
        participantUids.length === 0 &&
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
            participantUids,
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
        <YStack flex={1} gap="$4">
          <YStack gap="$5">
            <ContentCard
              title={isNeighborhoodWalk ? "Select Neighbors" : "Select Friends"}
              icon={<Users size={20} color={COLORS.textOnLight} />}
              description={
                isNeighborhoodWalk
                  ? "Walk2Gether neighbors in your area will be notified about your walk."
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
                    selectedUserIds={participantUids}
                    acceptedUserIds={acceptedUserIds}
                    emptyMessage={
                      isFriendsWalk
                        ? "Your friends aren't on Walk2Gether yet. Add friends to invite them to your walk."
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

                  {users.length > 0 && !isNeighborhoodWalk && (
                    <YStack
                      alignItems="center"
                      marginTop="$4"
                      paddingBottom="$2"
                      gap="$4"
                    >
                      <Text fontSize={14} color="$gray10" fontWeight="500">
                        Don't see your friend here yet?
                      </Text>

                      <FormControl label="Invite a new friend">
                        <XStack gap="$3" width="100%" alignItems="center">
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
          </YStack>
        </YStack>
      </WizardWrapper>
    </LinearGradient>
  );
};

export default InviteSelection;
