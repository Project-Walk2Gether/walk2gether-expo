import { useErrorReporting } from "@/components/ErrorBoundary";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { combineDateAndTime } from "@/utils/timezone";
import { isPast } from "@/utils/walkUtils";
import {
  deleteField,
  doc,
  FirebaseFirestoreTypes,
  setDoc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Check, Clock, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Text,
  XStack,
  YStack,
} from "tamagui";
import {
  Participant,
  TimeOption,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import TimeProposalSheet from "./TimeProposalSheet";

interface Props {
  walk: WithId<Walk>;
  participantDoc?: WithId<Participant>;
  onInvitationResponded?: () => void;
}

const RespondToInvitation: React.FC<Props> = ({
  walk,
  participantDoc,
  onInvitationResponded,
}) => {
  const { reportNonFatalError } = useErrorReporting();
  const router = useRouter();
  const { user } = useAuth();
  const { userData, updateUserData } = useUserData();
  const { showSheet, hideSheet } = useSheet();
  const [loading, setLoading] = useState(false);
  const [introduction, setIntroduction] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const cantMakeIt = !!participantDoc?.cancelledAt;
  const isApproved =
    !!participantDoc?.acceptedAt && !participantDoc?.cancelledAt;

  const walkIsPastWalk = isPast(walk);

  // Common function to handle walk actions (accept or cancel)
  const handleWalkAction = async (action: "accept" | "cancel") => {
    console.log("HWA");
    if (!user || !walk?.id) return;

    setLoading(true);

    try {
      // Create a request document for the user
      const participantId = user.uid; // Use the user's ID as the request ID
      const participantRef = doc(
        firestore_instance,
        `walks/${walk.id}/participants/${participantId}`
      ) as FirebaseFirestoreTypes.DocumentReference<Participant>;

      // Prepare common participant data fields
      const commonFields = {
        userUid: user.uid,
        displayName: userData?.name || "Anonymous",
        photoURL: userData?.profilePicUrl || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (action === "accept") {
        // Only include introduction for neighborhood walks
        const introductionValue = walkIsNeighborhoodWalk(walk)
          ? introduction.trim()
          : "";

        // Update existing participant document with acceptance data
        await updateDoc<Participant>(participantRef, {
          ...commonFields,
          status: "pending",
          acceptedAt: Timestamp.now(),
          introduction: introductionValue || deleteField(),
          cancelledAt: deleteField(),
        });

        // Save introduction to user profile if checkbox was checked
        if (saveToProfile && introductionValue && userData && user?.uid) {
          await updateUserData({
            introduction: introductionValue,
          });
        }

        // Show success alert and navigate
        Alert.alert(
          "Success!",
          `You've successfully joined ${walk.organizerName}'s walk!`,

          [
            {
              text: "OK",
              onPress: () => {
                if (onInvitationResponded) {
                  onInvitationResponded();
                } else {
                  router.replace({
                    pathname: "/walks/[id]/plan",
                    params: { id: walk.id },
                  });
                }
              },
            },
          ]
        );
      } else if (action === "cancel") {
        // Update the participant document with cancellation data
        await updateDoc(participantRef, {
          ...commonFields,
          cancelledAt: Timestamp.now(),
        });

        // Show cancellation confirmation and navigate
        Alert.alert(
          "Cancelled",
          `We've let ${walk.organizerName} know you can't make it.`,
          [
            {
              text: "OK",
              onPress: () => {
                if (onInvitationResponded) {
                  onInvitationResponded();
                } else {
                  router.replace({ pathname: "/walks" });
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error handling walk invitation:", error);
      reportNonFatalError(
        error as Error,
        { action: "respondToInvitation", walkId: walk.id },
        "Error responding to walk invitation"
      );
      Alert.alert(
        "Error",
        "There was a problem processing your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptButtonPress = () => handleWalkAction("accept");
  const handleCancelButtonPress = () => handleWalkAction("cancel");

  // Handler for proposing a new time
  const handleProposeNewTime = async (date: Date, time: Date) => {
    if (!walk || !user) return;

    setLoading(true);
    try {
      const combinedDateTime = combineDateAndTime(date, time);
      const proposedTimestamp = Timestamp.fromDate(combinedDateTime);

      // Get current timeOptions or initialize empty array
      const currentTimeOptions = walk.timeOptions || [];

      // Add the proposed time to timeOptions if it's not already there
      const timeExists = currentTimeOptions.some(
        (option) => {
          const optionTime = option.time;
          return Math.abs(optionTime.toMillis() - proposedTimestamp.toMillis()) < 60000; // Within 1 minute
        }
      );

      if (!timeExists) {
        const timeOption: TimeOption = { time: proposedTimestamp, votes: { [user.uid]: true } };
        const updatedTimeOptions = [...currentTimeOptions, timeOption];

        // Update the walk document with the new time option
        await updateDoc<Walk>(doc(firestore_instance, "walks", walk.id) as FirebaseFirestoreTypes.DocumentReference<Walk>, {
          timeOptions: updatedTimeOptions,
        });
      }

      // Create or update participant document with the proposed time preference
      const participantRef = doc(
        firestore_instance,
        "walks",
        walk.id,
        "participants",
        user.uid
      );

      // Get current timeVotes or initialize empty array
      const currentTimeVotes = (participantDoc as any)?.timeVotes || [];
      const timeMillis = proposedTimestamp.toMillis();

      // Add the proposed time to timeVotes if it's not already there
      const updatedTimeVotes = currentTimeVotes.includes(timeMillis)
        ? currentTimeVotes
        : [...currentTimeVotes, timeMillis];

      await setDoc(
        participantRef,
        {
          proposedTime: proposedTimestamp,
          proposedTimeAt: Timestamp.now(),
          timeVotes: updatedTimeVotes,
          displayName:
            (userData as any)?.displayName || user.displayName || "Anonymous",
          photoURL: (userData as any)?.photoURL || user.photoURL || null,
        },
        { merge: true }
      );

      hideSheet();
      console.log("Time proposed");
    } catch (error) {
      console.error("Error proposing new time:", error);

      // Provide more specific error messages based on the error type
      let errorMessage = "There was a problem proposing the new time. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = "You don't have permission to propose times for this walk. Please contact the walk organizer.";
        } else if (error.message.includes('not-found')) {
          errorMessage = "The walk could not be found. Please refresh and try again.";
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler for opening the time proposal sheet
  const handleOpenTimeProposal = () => {
    showSheet(
      <TimeProposalSheet
        onProposeTime={handleProposeNewTime}
        onClose={hideSheet}
        loading={loading}
      />,
      {
        title: "Propose a different time",
      }
    );
  };



  return (
    <YStack w="100%" gap="$4" ai="center">
      {isApproved ? (
        <Card
          backgroundColor={"$green2"}
          borderColor={"$green6"}
          borderWidth={1}
          padding="$4"
          marginBottom="$2"
          width="100%"
        >
          <YStack gap="$2" ai="center">
            <XStack gap="$2" ai="center" jc="center">
              <Check size="$1" color={"$green10"} />
              <Text fontSize="$5" fontWeight="bold" color="$green10">
                {walkIsPastWalk ? "You went!" : "You're Going!"}
              </Text>
            </XStack>
            {walkIsPastWalk ? null : (
              <Text fontSize="$3" textAlign="center" color="$green9">
                {walk.organizerName} is looking forward to seeing you at the
                walk
              </Text>
            )}
          </YStack>
        </Card>
      ) : cantMakeIt ? (
        <Card
          backgroundColor={"$red2"}
          borderColor={"$red6"}
          borderWidth={1}
          padding="$4"
          marginBottom="$2"
          width="100%"
        >
          <YStack gap="$2" ai="center">
            <XStack gap="$2" ai="center" jc="center">
              <X size="$1" color={"$red10"} />
              <Text fontSize="$5" fontWeight="bold" color="$red10">
                Not Attending
              </Text>
            </XStack>
            <Text fontSize="$3" textAlign="center" color="$red9">
              You've declined this walk invitation
            </Text>
          </YStack>
        </Card>
      ) : (
        <>
          {walkIsNeighborhoodWalk(walk) && (
            <YStack gap="$2" w="100%" mt="$2">
              <Label htmlFor="introduction" fontSize="$3" color="$gray11">
                Introduce Yourself (optional)
              </Label>
              <Input
                id="introduction"
                size="$4"
                placeholder="Hi, I'm excited to join this walk..."
                value={introduction}
                onChangeText={setIntroduction}
                multiline
                numberOfLines={3}
                autoCorrect
                textAlignVertical="top"
              />

              <XStack alignItems="center" gap="$2" marginTop="$1">
                <Checkbox
                  id="save-to-profile"
                  size="$4"
                  checked={saveToProfile}
                  onCheckedChange={(checked) => setSaveToProfile(!!checked)}
                >
                  <Checkbox.Indicator>
                    <Check />
                  </Checkbox.Indicator>
                </Checkbox>
                <Label htmlFor="save-to-profile" fontSize="$2" color="$gray11">
                  Save to my profile for future walks
                </Label>
              </XStack>
            </YStack>
          )}



          <YStack gap="$2" w="100%">
            <Button
              size="$5"
              w="100%"
              bg={COLORS.primary}
              color="white"
              onPress={handleAcceptButtonPress}
              disabled={loading}
              iconAfter={loading ? undefined : <Check color="white" />}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : walkIsNeighborhoodWalk(walk) ? (
                "Join This Walk"
              ) : (
                "Accept Invitation"
              )}
            </Button>

            {/* Propose new time button */}
            <Button
              size="$5"
              w="100%"
              borderWidth={1}
              borderColor={COLORS.primary}
              bg="white"
              color={COLORS.primary}
              onPress={handleOpenTimeProposal}
              disabled={loading}
              iconAfter={<Clock color={COLORS.primary} />}
            >
              Propose a different time
            </Button>

            <Button
              size="$5"
              w="100%"
              borderWidth={1}
              borderColor="$red6"
              bg="$red2"
              color="$red10"
              onPress={handleCancelButtonPress}
              disabled={loading}
              iconAfter={loading ? undefined : <X color="$red10" />}
            >
              {loading ? (
                <ActivityIndicator color="$red10" />
              ) : (
                "I can't make it"
              )}
            </Button>
          </YStack>
        </>
      )}
    </YStack>
  );
};

export default RespondToInvitation;
