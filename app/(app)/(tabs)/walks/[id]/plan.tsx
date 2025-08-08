import QuoteWithImage from "@/components/QuoteWithImage";
import EditRoundSheet from "@/components/Rounds/EditRoundSheet";
import QuestionPromptsForm from "@/components/Rounds/QuestionPromptsForm";
import RoundsList from "@/components/Rounds/RoundsList/RoundsList";
import WalkMinimumMinutesForm from "@/components/WalkMinimumMinutesForm";
import LocationCard from "@/components/WalkScreen/components/LocationCard";
import ParticipantsListVertical from "@/components/WalkScreen/components/ParticipantsListVertical";
import RespondToInvitationCard from "@/components/WalkScreen/components/RespondToInvitationCard";
import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import WalkTimeCard from "@/components/WalkScreen/components/WalkTimeCard";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useMenu } from "@/context/MenuContext";
import { useSheet } from "@/context/SheetContext";
import { useWalk } from "@/context/WalkContext";
import { getWalkStatus, isPast } from "@/utils/walkUtils";
import {
  FirebaseFirestoreTypes,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Edit3, Send } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import { Button, Text, View, YStack } from "tamagui";
import {
  MeetupWalk,
  Participant,
  Round,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";

export default function PlanTab() {
  const { walk } = useWalk();
  const router = useRouter();
  const { user } = useAuth();
  const { showMessage } = useFlashMessage();
  const { showSheet, hideSheet } = useSheet();

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

  const walkIsPastWalk = isPast(walk);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <YStack p="$4" gap="$4" pb="$w6">
        {walkIsMeetupWalk(walk) &&
          (isMine || (walk as MeetupWalk).descriptionMarkdown) && (
            <WalkDetailsCard
              title="Description"
              headerAction={
                isMine ? (
                  <Button
                    size="$2"
                    circular
                    icon={<Edit3 size={16} />}
                    onPress={() => router.push(`/(app)/(modals)/edit-walk-topic?id=${walk.id}`)}
                  />
                ) : undefined
              }
            >
              <Markdown>{(walk as MeetupWalk).descriptionMarkdown}</Markdown>
            </WalkDetailsCard>
          )}

        {isMine || walkIsPastWalk ? null : (
          <RespondToInvitationCard
            walk={walk}
            participantDoc={currentUserParticipantDoc || undefined}
            hasResponded={hasResponded}
            loading={loading}
            onMenuPress={handleShowParticipationMenu}
          />
        )}

        {/* Walk Time Card */}
        <WalkTimeCard
          walkDate={walk.date ? walk.date.toDate() : undefined}
          durationMinutes={walk.durationMinutes}
          walkId={walk.id}
          showEditButton={isWalkOwner}
          timeOptions={walk.timeOptions || []}
          participants={participants || []}
          isWalkOwner={isWalkOwner}
        />

        {/* Location Card */}
        <LocationCard
          startLocation={walk.startLocation}
          currentLocation={walk.currentLocation}
          walkId={walk.id}
          hasMeetupSpotPhoto={!!walk.meetupSpotPhoto}
          showEditButton={isWalkOwner}
        />

        {/* Participants Section - only shown for walk owner or friends walks */}
        {canViewParticipants && (
          <WalkDetailsCard
            title="Participants"
            headerAction={
              isWalkOwner && walk?.id ? (
                <Button
                  mt="$2"
                  size="$2"
                  theme="blue"
                  iconAfter={Send}
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
                  Invite
                </Button>
              ) : undefined
            }
          >
            <YStack w="100%">
              {isLoadingParticipants ? (
                <View height={50} justifyContent="center" alignItems="center">
                  <Text>Loading participants...</Text>
                </View>
              ) : (
                <ParticipantsListVertical
                  walkStatus={walkStatus}
                  participants={(participants as any[]) || []}
                  currentUserId={user?.uid}
                  isOwner={isWalkOwner}
                  walkStartDate={walk.date?.toDate()}
                  onParticipantPress={() => { }}
                  useFlatList={false}
                />
              )}
            </YStack>
          </WalkDetailsCard>
        )}

        {/* Rounds Management - only for meetup walk owners */}
        {isWalkOwner && walk.type === "meetup" && (
          <>
            <RoundsList
              walk={walk as any}
              onEditActualRound={(round: WithId<Round>) => {
                showSheet(
                  <EditRoundSheet
                    round={round}
                    onClose={hideSheet}
                    onSave={hideSheet}
                  />
                );
              }}
            />
            <QuestionPromptsForm walk={walk as any} />
            <WalkMinimumMinutesForm walk={walk as any} />
          </>
        )}

        {/* Quote and Image at the bottom */}
        {walk.type !== "meetup" && (
          <YStack alignItems="center" marginTop="$4">
            <QuoteWithImage imageSize={180} skipAnimation={true} />
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
