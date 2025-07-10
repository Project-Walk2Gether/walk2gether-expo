import { useAuth } from "@/context/AuthContext";
import BottomSheet from "@gorhom/bottom-sheet";
import firestore from "@react-native-firebase/firestore";
import { ChevronRight, Info } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, Round, Walk, WithId } from "walk2gether-shared";
import { formatTimeLeft } from "../../../utils/dateUtils";
import { COLORS } from "./constants";
import { EditPromptSheet } from "./EditPromptSheet";
import { RotationTimer } from "./RotationTimer";
import { UpcomingRound } from "./UpcomingRound";
import { useInterval } from "./useInterval";

interface Props {
  walkId: string;
  walk: WithId<Walk>;
  onRoundActivated?: (round: Round) => void;
}

export default function UpcomingRoundsList({
  walkId,
  walk,
  onRoundActivated,
}: Props) {
  // Get walk data from context
  const { user } = useAuth();

  // Check if the walk is a MeetupWalk by checking if it has upcomingRounds property
  const isMeetupWalk = walk && "upcomingRounds" in walk;

  // Use upcomingRounds from props if provided, otherwise from walk context if it's a MeetupWalk
  const upcomingRounds = isMeetupWalk
    ? (walk as unknown as MeetupWalk).upcomingRounds || []
    : [];
  const currentUserId = user?.uid;
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isRotating, setIsRotating] = useState(false);
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(
    null
  );
  const [promptText, setPromptText] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Calculate time until next round rotation (5 minutes from now)
  useInterval(() => {
    if (upcomingRounds.length > 0) {
      const now = new Date();
      const nextRotation = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      const formatted = formatTimeLeft(now, nextRotation);
      setTimeLeft(formatted);
    }
  }, 1000);

  // Handle rotating to the next round
  const handleRotate = async () => {
    if (upcomingRounds.length === 0 || !currentUserId || !walk) return;

    try {
      setIsRotating(true);

      // Get the first upcoming round
      const nextRound = upcomingRounds[0];

      // Create a batch to perform multiple operations atomically
      const batch = firestore().batch();

      // Reference to the walk document
      const walkRef = firestore().collection("walks").doc(walkId);

      // Reference for the new round document
      const newRoundRef = walkRef.collection("rounds").doc();

      // Create a new round document in Firestore
      const roundData = {
        ...nextRound,
        startTime: firestore.FieldValue.serverTimestamp(),
      };

      // Add the round to the rounds collection
      batch.set(newRoundRef, roundData);

      // Update the walk document to remove the first round from upcomingRounds
      const remainingRounds = upcomingRounds.slice(1);
      batch.update(walkRef, { upcomingRounds: remainingRounds });

      // Commit the batch
      await batch.commit();

      // Notify parent component that a round was activated
      if (onRoundActivated) {
        onRoundActivated(nextRound);
      }

      setIsRotating(false);
    } catch (error) {
      console.error("Error rotating to next round:", error);
      setIsRotating(false);
    }
  };

  // Handle editing a round's question prompt
  const handleEditPrompt = (index: number) => {
    setPromptText(upcomingRounds[index].questionPrompt || "");
    setEditingPromptIndex(index);
    bottomSheetRef.current?.expand();
  };

  // Save the edited question prompt
  const handleSavePrompt = async () => {
    if (editingPromptIndex === null) return;

    try {
      // Update the upcomingRounds array in the walk document
      const updatedRounds = [...upcomingRounds];
      updatedRounds[editingPromptIndex] = {
        ...updatedRounds[editingPromptIndex],
        questionPrompt: promptText,
      };

      await firestore().collection("walks").doc(walkId).update({
        upcomingRounds: updatedRounds,
      });

      // Close the bottom sheet
      bottomSheetRef.current?.close();
      setEditingPromptIndex(null);
    } catch (error) {
      console.error("Error saving question prompt:", error);
    }
  };

  if (upcomingRounds.length === 0) return null;

  return (
    <Card
      bordered
      elevate
      size="$4"
      margin="$4"
      backgroundColor="white"
      borderRadius="$4"
    >
      {/* Owner-only indicator */}
      <XStack
        backgroundColor="$blue2"
        padding="$2"
        alignItems="center"
        space="$2"
        borderTopLeftRadius="$4"
        borderTopRightRadius="$4"
      >
        <Info size={16} color={COLORS.primary} />
        <Text fontSize="$2" color="$blue8">
          Only shown to you, the walk owner
        </Text>
      </XStack>

      <YStack padding="$2">
        {/* Next upcoming round */}

        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$2"
          marginBottom="$2"
        >
          <Text fontSize="$6" fontWeight="bold">
            Next Round
          </Text>

          <Button
            size="$3"
            backgroundColor="$blue2"
            color="$blue8"
            iconAfter={ChevronRight}
            onPress={() =>
              router.push(`/(app)/(modals)/upcoming-rounds?walkId=${walkId}`)
            }
          >
            View All
          </Button>
        </XStack>
        {/* Rotation timer and button */}
        <RotationTimer
          timeLeft={timeLeft}
          isRotating={isRotating}
          onRotate={handleRotate}
          hasRounds={upcomingRounds.length > 0}
        />

        {upcomingRounds.length > 0 && (
          <UpcomingRound
            key="next-round"
            round={upcomingRounds[0]}
            index={0}
            isExpanded={true}
            onToggleExpand={() => {}}
            onEditPrompt={() => handleEditPrompt(0)}
          />
        )}
      </YStack>

      {/* Bottom sheet for editing question prompt */}
      <EditPromptSheet
        ref={bottomSheetRef}
        promptText={promptText}
        setPromptText={setPromptText}
        onSave={handleSavePrompt}
      />
    </Card>
  );
}
