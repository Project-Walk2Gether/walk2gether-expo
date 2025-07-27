import RoundCard from "@/components/RoundCard";
import QuestionPromptsList from "@/components/WalkScreen/components/QuestionPromptsList";
import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useQuery } from "@/utils/firestore";
import firestore, {
  collection,
  FirebaseFirestoreTypes,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import { Info } from "@tamagui/lucide-icons";
import { differenceInMinutes } from "date-fns";
import React, { useMemo, useState } from "react";
import { Text, XStack, YStack } from "tamagui";
import {
  MeetupWalk,
  Round,
  Walk,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";
import EditRoundSheet from "../EditRoundSheet";
import { COLORS } from "./constants";
import { EditUpcomingRoundSheet } from "./EditUpcomingRoundSheet";

interface Props {
  walk: WithId<Walk>;
}

export default function RoundsList({ walk }: Props): React.ReactNode {
  // Get walk data from context
  const { user } = useAuth();
  const [isRotating, setIsRotating] = useState(false);

  // State for managing expanded items
  const [expandedActualRoundId, setExpandedActualRoundId] = useState<
    string | null
  >(null);
  const [expandedUpcomingRoundIndex, setExpandedUpcomingRoundIndex] =
    useState<number>(0); // Start with first upcoming round expanded

  // Check if the walk is a MeetupWalk by checking if it has upcomingRounds property
  const isMeetupWalk = walkIsMeetupWalk(walk);
  // Use upcomingRounds from props if provided, otherwise from walk context if it's a MeetupWalk
  const upcomingRounds = isMeetupWalk
    ? (walk as unknown as MeetupWalk).upcomingRounds || []
    : [];

  const currentUserId = user!.uid;

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Query for actual rounds with end time (completed rounds) - limit to last 3
  const actualRoundsQuery = useMemo(() => {
    if (!walk?._ref) return undefined;
    return query(
      collection(
        walk._ref as unknown as FirebaseFirestoreTypes.DocumentReference<Walk>,
        "rounds"
      ),
      where("endTime", "!=", null),
      orderBy("endTime", "asc"),
      orderBy("roundNumber", "asc")
    );
  }, [walk?._ref]);

  // Fetch actual rounds from Firestore
  const { docs: actualRoundsRaw } = useQuery(actualRoundsQuery);

  // Properly type the actual rounds
  const actualRounds = useMemo(() => {
    return (actualRoundsRaw || []) as WithId<Round>[];
  }, [actualRoundsRaw]);

  const { showSheet, hideSheet } = useSheet();

  // Handle editing the prompt for an actual round
  const handleEditActualRound = (round: WithId<Round>) => {
    if (!round._ref) return;

    showSheet(
      <EditRoundSheet
        round={round}
        onClose={() => hideSheet()}
        onSave={() => hideSheet()}
      />
    );
  };

  // Handle editing the prompt for an upcoming round
  const handleEditPrompt = (index: number) => {
    if (!walk) return;

    // For the first upcoming round, also show duration picker
    const isFirstRound = index === 0;
    const suggestedDuration = isFirstRound
      ? calculateSuggestedDuration()
      : undefined;

    showSheet(
      <EditUpcomingRoundSheet
        walk={walk}
        roundIndex={index}
        suggestedDuration={suggestedDuration}
        showDurationPicker={isFirstRound}
        onStartRound={isFirstRound ? startRoundWithDuration : undefined}
        onClose={() => hideSheet()}
      />
    );
  };

  // Calculate suggested round duration based on remaining time and rounds
  const calculateSuggestedDuration = () => {
    if (!walk || !walk.estimatedEndTime || upcomingRounds.length === 0) {
      return 15; // Default to 15 minutes if we can't calculate
    }

    // Calculate minutes between now and estimated end time
    const now = new Date();
    const estimatedEndTime = walk.estimatedEndTime.toDate();
    const remainingMinutes = differenceInMinutes(estimatedEndTime, now);

    // If we have negative time remaining or very little time, use a minimum duration
    if (remainingMinutes <= 5) {
      return 5; // Minimum duration of 5 minutes
    }

    // Calculate suggested duration based on remaining time and upcoming rounds
    let suggestedDuration = Math.floor(
      remainingMinutes / upcomingRounds.length
    );

    // Cap the duration between 5 and 30 minutes
    suggestedDuration = Math.max(5, Math.min(30, suggestedDuration));

    // Round to the nearest 5 minutes
    return Math.round(suggestedDuration / 5) * 5;
  };

  // Handle rotating to the next round - starts the round immediately with suggested duration
  const handleRotate = async () => {
    if (upcomingRounds.length === 0 || !currentUserId || !walk) return;

    try {
      setIsRotating(true);
      // Get the suggested duration and start the round immediately
      const suggestedDuration = calculateSuggestedDuration();
      await startRoundWithDuration(suggestedDuration);
    } catch (error) {
      console.error("Error rotating rounds:", error);
      setIsRotating(false);
    }
  };

  // Start the round with the selected duration
  const startRoundWithDuration = async (durationMinutes: number) => {
    if (upcomingRounds.length === 0 || !currentUserId || !walk) {
      setIsRotating(false);
      return;
    }

    try {
      // Get the first upcoming round
      const nextRound = upcomingRounds[0];

      // Create a batch to perform multiple operations atomically
      const batch = firestore().batch();

      // Reference for the new round document
      const newRoundRef = (walk._ref as any).collection("rounds").doc();

      // Calculate round duration in milliseconds
      const roundDurationMs = durationMinutes * 60 * 1000;

      // Create a new round document in Firestore
      const roundData = {
        ...nextRound,
        createdAt: firestore.FieldValue.serverTimestamp(),
        startTime: firestore.FieldValue.serverTimestamp(),
        // Set endTime based on the selected duration
        endTime: firestore.Timestamp.fromDate(
          new Date(Date.now() + roundDurationMs)
        ),
      };

      // Add the round to the rounds collection
      batch.set(newRoundRef, roundData);

      // Update the walk document to remove the first upcoming round and shift others up
      if (isMeetupWalk) {
        const updatedUpcomingRounds = [...upcomingRounds.slice(1)];
        batch.update(walk._ref as any, {
          upcomingRounds: updatedUpcomingRounds,
        });
      }

      // Commit the batch
      await batch.commit();

      // Hide the sheet
      hideSheet();
    } catch (error) {
      console.error("Error rotating rounds:", error);
    } finally {
      setIsRotating(false);
    }
  };

  // Toggle expanded state for actual rounds
  const toggleActualRoundExpanded = (roundId: string) => {
    setExpandedActualRoundId((prev: string | null) =>
      prev === roundId ? null : roundId
    );
  };

  // Toggle expanded state for upcoming rounds
  const toggleUpcomingRoundExpanded = (index: number) => {
    setExpandedUpcomingRoundIndex((prev: number) =>
      prev === index ? -1 : index
    );
  };

  return (
    <WalkDetailsCard
      title="Rounds"
      headerAction={
        <XStack
          backgroundColor="$blue2"
          padding="$2"
          alignItems="center"
          space="$2"
          borderRadius="$2"
        >
          <Info size={16} color={COLORS.primary} />
          <Text fontSize="$2" color="$blue8">
            Only shown to you, the walk owner
          </Text>
        </XStack>
      }
    >
      <YStack space="$4" width="100%">
        {/* Map over actual rounds (including active) */}
        {actualRounds.map((round) => (
          <RoundCard
            key={`actual-round-${round.id}`}
            round={round}
            isExpanded={expandedActualRoundId === round.id}
            isActual={true}
            onToggleExpand={() => toggleActualRoundExpanded(round.id)}
            onEditPrompt={() => handleEditActualRound(round)}
          />
        ))}

        {/* Map over upcoming rounds */}
        {upcomingRounds.map((round, index) => (
          <RoundCard
            key={`upcoming-round-${index}`}
            round={round}
            isExpanded={expandedUpcomingRoundIndex === index}
            isActual={false}
            isFirstUpcoming={index === 0}
            isWalkOwner={isWalkOwner}
            onToggleExpand={() => toggleUpcomingRoundExpanded(index)}
            onEditPrompt={() => handleEditPrompt(index)}
            onStartRound={index === 0 ? handleRotate : undefined}
            suggestedDuration={
              index === 0 ? calculateSuggestedDuration() : undefined
            }
            isRotating={isRotating}
          />
        ))}

        {/* Empty state */}
        {actualRounds.length === 0 && upcomingRounds.length === 0 && (
          <YStack>
            <Text color="$gray9" textAlign="center" padding="$4">
              Once the walk starts, participants will be matched into pairs
              throughout the walk. Add question prompts to give pairs something
              to talk about during each round.
            </Text>
            {/* Question Prompts - only for meetup walks */}

            <QuestionPromptsList
              walk={walk as MeetupWalk}
              isWalkOwner={isWalkOwner}
            />
          </YStack>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
