import QuoteWithImage from "@/components/QuoteWithImage";
import RoundsList from "@/components/Rounds/RoundsList";
import ParticipantsListVertical from "@/components/WalkScreen/components/ParticipantsListVertical";
import RespondToInvitationCard from "@/components/WalkScreen/components/RespondToInvitationCard";
import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import WalkInfoCard from "@/components/WalkScreen/components/WalkInfoCard";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useMenu } from "@/context/MenuContext";
import { useWalk } from "@/context/WalkContext";
import { getWalkStatus } from "@/utils/walkUtils";
import {
  FirebaseFirestoreTypes,
  updateDoc,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import { Button, Text, View, YStack } from "tamagui";
import { MeetupWalk, Participant } from "walk2gether-shared";

export default function DetailsTab() {
  const { walk } = useWalk();
  const { user } = useAuth();
  const { showMessage } = useFlashMessage();

  // Get participants data from context
  const {
    participants,
    goBack,
    currentUserParticipantDoc,
    isLoadingParticipants,
  } = useWalk();

  // Check if current user is the owner of the walk
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Determine if user can view participants (owner or friends walk)
  const canViewParticipants = useMemo(() => {
    if (!walk) return false;
    return isWalkOwner || walk.type === "friends";
  }, [walk, isWalkOwner]);

  // Determine if the user has responded to the invitation
  const hasResponded = useMemo(() => {
    if (!currentUserParticipantDoc) return false;
    return (
      !!currentUserParticipantDoc.acceptedAt ||
      !!currentUserParticipantDoc.cancelledAt
    );
  }, [currentUserParticipantDoc]);

  // Determine if the user has explicitly declined the invitation
  const hasDeclined = useMemo(() => {
    if (!currentUserParticipantDoc) return false;
    return !!currentUserParticipantDoc.cancelledAt;
  }, [currentUserParticipantDoc]);

  const [loading, setLoading] = useState(false);
  const { showMenu } = useMenu();
  const isMine = walk?.createdByUid === user?.uid;

  // Handle participation changes
  const handleToggleParticipation = async () => {
    if (!walk || !currentUserParticipantDoc || !user) return;

    console.log("Toggling participation", { hasDeclined });

    try {
      setLoading(true);

      const participantRef = walk._ref
        .collection("participants")
        .doc(user.uid) as FirebaseFirestoreTypes.DocumentReference<Participant>;

      if (hasDeclined) {
        // User wants to re-accept the invitation
        await updateDoc(participantRef, {
          acceptedAt: Timestamp.now(),
          status: "pending",
          cancelledAt: null,
          hiddenAt: null,
        });

        showMessage("Great! You're now attending this walk.", "success");
      } else {
        // User wants to cancel participation
        await updateDoc(participantRef, {
          cancelledAt: Timestamp.now(),
        });

        goBack();

        showMessage(
          "You've cancelled your participation in this walk.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating participation:", error);
      showMessage(
        "There was a problem updating your participation status.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show the menu with the appropriate option
  const handleShowParticipationMenu = () => {
    if (!hasResponded) return;

    showMenu("Respond to request", [
      {
        label: hasDeclined ? "I can make it" : "I can no longer make it",
        theme: hasDeclined ? "green" : "red",
        onPress: handleToggleParticipation,
      },
    ]);
  };

  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Walk information not available</Text>
      </View>
    );
  }

  const walkStatus = getWalkStatus(walk);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack p="$4" gap="$4" pb="$w6">
        {/* Use type assertion since descriptionMarkdown exists but isn't in the type definition yet */}
        {(walk as MeetupWalk).descriptionMarkdown && (
          <WalkDetailsCard title="Description">
            <Markdown>{(walk as MeetupWalk).descriptionMarkdown}</Markdown>
          </WalkDetailsCard>
        )}
        {isMine ? null : (
          <RespondToInvitationCard
            walk={walk}
            participantDoc={currentUserParticipantDoc || undefined}
            hasResponded={hasResponded}
            loading={loading}
            onMenuPress={handleShowParticipationMenu}
          />
        )}
        {/* Walk Info Card */}
        <WalkInfoCard
          walkDate={walk.date ? walk.date.toDate() : undefined}
          durationMinutes={walk.durationMinutes}
          // location={walk.currentLocation}
          // locationName={walk.currentLocation?.name}
          notes={walk.startLocation?.notes}
        />
        {/* Participants Section - only shown for walk owner or friends walks */}
        {canViewParticipants && (
          <WalkDetailsCard title="Participants">
            <YStack w="100%">
              {isLoadingParticipants ? (
                <View height={50} justifyContent="center" alignItems="center">
                  <Text>Loading participants...</Text>
                </View>
              ) : (
                <ParticipantsListVertical
                  walkId={walk.id}
                  walkStatus={walkStatus}
                  participants={(participants as any[]) || []}
                  currentUserId={user?.uid}
                  isOwner={isWalkOwner}
                  walkStartDate={walk.date?.toDate()}
                  onParticipantPress={() => {}}
                />
              )}
              {isWalkOwner && walk?.id && (
                <Button
                  mt="$2"
                  variant="outlined"
                  onPress={() => {
                    // For friend walks, include the addFriend parameter
                    const params: { walkId: string; addFriend?: string } = {
                      walkId: walk.id,
                    };

                    // Only include addFriend parameter for friend type walks
                    if (walk.type === "friends") {
                      params.addFriend = "true";
                    }

                    router.push({
                      pathname: "/invite",
                      params,
                    });
                  }}
                >
                  Invite others
                </Button>
              )}
            </YStack>
          </WalkDetailsCard>
        )}

        {/* Show UpcomingRoundsList only for walk owners */}
        {isWalkOwner && <RoundsList walk={walk} />}

        {/* Quote and Image at the bottom */}
        <YStack alignItems="center" marginTop="$4">
          <QuoteWithImage imageSize={180} skipAnimation={true} />
        </YStack>
      </YStack>
    </ScrollView>
  );
}
