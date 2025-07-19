import { useErrorReporting } from "@/components/ErrorBoundary";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import {
  deleteField,
  doc,
  FirebaseFirestoreTypes,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Check } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { Button, Checkbox, Input, Label, Text, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  participantDoc?: Participant;
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
  const [loading, setLoading] = useState(false);
  const [introduction, setIntroduction] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const cantMakeIt = !!participantDoc?.cancelledAt;
  const isApproved =
    !!participantDoc?.acceptedAt && !participantDoc?.cancelledAt;

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
        sourceType: "requested" as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (action === "accept") {
        // Only include introduction for neighborhood walks
        const introductionValue = walkIsNeighborhoodWalk(walk)
          ? introduction.trim()
          : "";

        console.log("ABOUT TO UPDATE");

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
                    pathname: "/walks/[id]/details",
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

  return (
    <YStack w="100%" gap="$4" ai="center">
      {isApproved ? (
        <>
          <Text fontSize="$4" textAlign="center" color="$gray11">
            You're going!
          </Text>
        </>
      ) : cantMakeIt ? (
        <Text fontSize="$4" textAlign="center" color="$gray11" mb="$2">
          You've said you can't make it to this walk.
        </Text>
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

          <YStack space="$2" w="100%">
            <Button
              size="$5"
              w="100%"
              bg={COLORS.primary}
              color="white"
              onPress={handleAcceptButtonPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : walkIsNeighborhoodWalk(walk) ? (
                "Join This Walk"
              ) : (
                "Accept Invitation"
              )}
            </Button>

            <Button
              size="$5"
              w="100%"
              bg="rgba(255, 0, 0, 0.05)"
              color="$gray10"
              onPress={handleCancelButtonPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="$gray11" />
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
