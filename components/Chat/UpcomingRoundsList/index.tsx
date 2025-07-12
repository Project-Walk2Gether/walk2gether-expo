import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useQuery } from "@/utils/firestore";
import firestore, {
  collection,
  FirebaseFirestoreTypes,
  orderBy,
  query,
} from "@react-native-firebase/firestore";
import { ChevronRight, Info } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import {
  MeetupWalk,
  Round,
  Walk,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";
import { COLORS } from "./constants";
import { EditPromptSheet } from "./EditPromptSheet";
import { RotationTimer } from "./RotationTimer";
import { UpcomingRound } from "./UpcomingRound";

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
  const isMeetupWalk = walkIsMeetupWalk(walk);
  // Use upcomingRounds from props if provided, otherwise from walk context if it's a MeetupWalk
  const upcomingRounds = isMeetupWalk
    ? (walk as unknown as MeetupWalk).upcomingRounds || []
    : [];
  const currentUserId = user!.uid;
  const router = useRouter();
  const [isRotating, setIsRotating] = useState(false);
  const walkRef = collection(firestore_instance, "walks").doc(walkId);
  const roundsQuery = query(
    collection(walkRef, "rounds"),
    orderBy("startTime")
  );
  const roundsSnapshot = useQuery(roundsQuery);
  const rounds = roundsSnapshot.docs as WithId<Round>[];
  const currentRound = rounds[rounds.length - 1];
  const { showSheet, hideSheet } = useSheet();
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
      // Reference for the new round document
      const newRoundRef = walk._ref.collection("rounds").doc();

      // Create a new round document in Firestore
      const roundData = {
        ...nextRound,
        startTime: firestore.FieldValue.serverTimestamp(),
        // Set endTime to 5 minutes from now
        endTime: firestore.Timestamp.fromDate(
          new Date(Date.now() + 5 * 60 * 1000)
        ),
      };

      // Add the round to the rounds collection
      batch.set(newRoundRef, roundData);

      // Update the walk document to remove the first round from upcomingRounds
      const remainingRounds = upcomingRounds.slice(1);
      batch.update(
        walk._ref as unknown as FirebaseFirestoreTypes.DocumentReference,
        { upcomingRounds: remainingRounds }
      );

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
    showSheet(
      <EditPromptSheet onClose={hideSheet} roundIndex={index} walk={walk} />
    );
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
              router.push(`/(app)/(modals)/walk-rounds?walkId=${walkId}`)
            }
          >
            View All Rounds
          </Button>
        </XStack>
        {/* Rotation timer and button */}
        <RotationTimer
          currentRound={currentRound}
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
    </Card>
  );
}
