import { useErrorReporting } from "@/components/ErrorBoundary";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
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
import { ActivityIndicator, Alert, Platform } from "react-native";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "react-native-calendars";
import { combineDateAndTime } from "@/utils/timezone";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";

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
  const [loading, setLoading] = useState(false);
  const [introduction, setIntroduction] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [showTimeProposal, setShowTimeProposal] = useState(false);
  const [proposedDate, setProposedDate] = useState<Date>(new Date());
  const [proposedTime, setProposedTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isAndroid = Platform.OS === "android";
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
  const handleProposeNewTime = async () => {
    if (!walk || !user) return;

    setLoading(true);
    try {
      const combinedDateTime = combineDateAndTime(proposedDate, proposedTime);
      const proposedTimestamp = Timestamp.fromDate(combinedDateTime);
      
      // Get current timeOptions or initialize empty array
      const currentTimeOptions = walk.timeOptions || [];
      
      // Add the proposed time to timeOptions if it's not already there
      const timeExists = currentTimeOptions.some(
        (option) => Math.abs(option.toMillis() - proposedTimestamp.toMillis()) < 60000 // Within 1 minute
      );
      
      if (!timeExists) {
        const updatedTimeOptions = [...currentTimeOptions, proposedTimestamp];
        
        // Update the walk document with the new time option
        await updateDoc(doc(firestore_instance, "walks", walk.id), {
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
      
      await setDoc(participantRef, {
        proposedTime: proposedTimestamp,
        proposedTimeAt: Timestamp.now(),
        displayName: (userData as any)?.displayName || user.displayName || "Anonymous",
        photoURL: (userData as any)?.photoURL || user.photoURL || null,
      }, { merge: true });
      
      setShowTimeProposal(false);
      Alert.alert(
        "Time Proposed!",
        "Your time suggestion has been sent to the walk organizer.",
        [
          {
            text: "OK",
            onPress: () => {
              if (onInvitationResponded) {
                onInvitationResponded();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error proposing new time:", error);
      Alert.alert(
        "Error",
        "There was a problem proposing the new time. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Date picker handler
  const handleDateChange = (day: any) => {
    const newDate = new Date(day.timestamp);
    setProposedDate(newDate);
  };

  // Time picker handler
  const handleTimeChange = (_: any, selectedTimeValue?: Date) => {
    if (selectedTimeValue) {
      setProposedTime(selectedTimeValue);
    }
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
                You're Going!
              </Text>
            </XStack>
            <Text fontSize="$3" textAlign="center" color="$green9">
              {walk.organizerName} is looking forward to seeing you at the walk
            </Text>
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

          {/* Time proposal section */}
          {showTimeProposal && (
            <Card backgroundColor="white" borderRadius={10} padding={15} marginBottom="$3">
              <Text fontSize="$4" fontWeight="600" marginBottom="$3">
                Propose a different time
              </Text>
              
              <Card backgroundColor="#f9f9f9" borderRadius={10} padding={10} marginBottom="$3">
                <Calendar
                  minDate={new Date().toISOString().split("T")[0]}
                  onDayPress={handleDateChange}
                  theme={{
                    selectedDayBackgroundColor: COLORS.primary,
                    todayTextColor: COLORS.primary,
                    arrowColor: COLORS.primary,
                  }}
                  markedDates={{
                    [proposedDate.toISOString().split("T")[0]]: {
                      selected: true,
                    },
                  }}
                />
              </Card>

              <Card backgroundColor="#f9f9f9" borderRadius={10} padding={10} marginBottom="$3">
                {isAndroid ? (
                  <YStack alignItems="center" gap="$2">
                    <Text fontSize="$3" fontWeight="500">
                      Selected Time:{" "}
                      {proposedTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Button
                      backgroundColor={COLORS.primary}
                      color="white"
                      onPress={() => setShowTimePicker(true)}
                      size="$3"
                    >
                      Select Time
                    </Button>
                    {showTimePicker && (
                      <DateTimePicker
                        value={proposedTime}
                        mode="time"
                        is24Hour={false}
                        onChange={(event, selectedTimeValue) => {
                          setShowTimePicker(false);
                          handleTimeChange(event, selectedTimeValue);
                        }}
                        minuteInterval={5}
                      />
                    )}
                  </YStack>
                ) : (
                  <DateTimePicker
                    value={proposedTime}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    themeVariant="light"
                    minuteInterval={5}
                  />
                )}
              </Card>

              <XStack gap="$2">
                <Button
                  flex={1}
                  backgroundColor="$gray6"
                  color="$gray12"
                  onPress={() => setShowTimeProposal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  backgroundColor={COLORS.primary}
                  color="white"
                  onPress={handleProposeNewTime}
                  disabled={loading}
                  iconAfter={loading ? undefined : <Clock color="white" />}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Propose Time"}
                </Button>
              </XStack>
            </Card>
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
              onPress={() => setShowTimeProposal(true)}
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
