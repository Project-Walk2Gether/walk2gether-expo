import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useQuery } from "@/utils/firestore";
import firestore, {
  collection,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import { Info } from "@tamagui/lucide-icons";
import React, { useMemo, useState } from "react";
import { Text, XStack, YStack } from "tamagui";
import {
  MeetupWalk,
  Round,
  Walk,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";
import { COLORS } from "./constants";
import { EditUpcomingRoundSheet } from "./EditUpcomingRoundSheet";
import { RoundItem } from "./RoundItem";

interface Props {
  walkId: string;
  walk: WithId<Walk>;
  onRoundActivated?: (round: Round) => void;
}

export default function RoundsList({ walkId, walk, onRoundActivated }: Props) {
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

  // Query for active round (no endTime set)
  const activeRoundQuery = useMemo(() => {
    if (!walk?._ref) return undefined;
    return query(
      collection(walk._ref as any, "rounds"),
      where("endTime", "==", null),
      orderBy("startTime", "asc")
    );
  }, [walk?._ref]);

  // Fetch active round
  const { docs: activeRounds } = useQuery(activeRoundQuery);
  const activeRound = activeRounds?.[0] as WithId<Round> | undefined;

  // Query for actual rounds with end time (completed rounds) - limit to last 3
  const actualRoundsQuery = useMemo(() => {
    if (!walk?._ref) return undefined;
    return query(
      collection(walk._ref as any, "rounds"),
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

  // Handle editing an upcoming round's question prompt
  const handleEditPrompt = (index: number) => {
    showSheet(
      <EditUpcomingRoundSheet
        onClose={hideSheet}
        roundIndex={index}
        walk={walk}
      />
    );
  };

  // Handle rotating to the next round
  const handleRotate = async () => {
    if (upcomingRounds.length === 0 || !currentUserId || !walk) return;

    try {
      setIsRotating(true);

      // Get the first upcoming round
      const nextRound = upcomingRounds[0];

      // Create a batch to perform multiple operations atomically
      const batch = firestore().batch();

      // Reference for the new round document
      const newRoundRef = (walk._ref as any).collection("rounds").doc();

      // Configure round duration (15 minutes by default)
      // You can adjust this value based on your needs
      const ROUND_DURATION_MINUTES = 15;
      const roundDurationMs = ROUND_DURATION_MINUTES * 60 * 1000;
      
      // Create a new round document in Firestore
      const roundData = {
        ...nextRound,
        createdAt: firestore.FieldValue.serverTimestamp(),
        startTime: firestore.FieldValue.serverTimestamp(),
        // Set endTime based on the round's duration
        endTime: firestore.Timestamp.fromDate(
          new Date(Date.now() + roundDurationMs)
        ),
      };

      // Add the round to the rounds collection
      batch.set(newRoundRef, roundData);

      // If there's a current active round, update its endTime to now
      if (activeRound) {
        const activeRoundRef = activeRound._ref as any;
        batch.update(activeRoundRef, {
          endTime: firestore.FieldValue.serverTimestamp(),
        });
      }

      // Update the walk document to remove the first upcoming round and shift others up
      if (isMeetupWalk) {
        const updatedUpcomingRounds = [...upcomingRounds.slice(1)];
        batch.update(walk._ref as any, {
          upcomingRounds: updatedUpcomingRounds,
        });
      }

      // Commit the batch
      await batch.commit();

      // Notify the onRoundActivated callback if provided
      if (onRoundActivated) {
        onRoundActivated(nextRound);
      }
    } catch (error) {
      console.error("Error rotating rounds:", error);
    } finally {
      setIsRotating(false);
    }
  };

  // Toggle expanded state for actual rounds
  const toggleActualRoundExpanded = (roundId: string) => {
    setExpandedActualRoundId((prev) => (prev === roundId ? null : roundId));
  };

  // Toggle expanded state for upcoming rounds
  const toggleUpcomingRoundExpanded = (index: number) => {
    setExpandedUpcomingRoundIndex((prev) => (prev === index ? -1 : index));
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
        {actualRounds.map((round, index) => (
          <RoundItem
            key={`actual-round-${round.id}`}
            round={round}
            index={index}
            isExpanded={expandedActualRoundId === round.id}
            isActual={true}
            onToggleExpand={() => toggleActualRoundExpanded(round.id)}
          />
        ))}

        {/* Map over upcoming rounds */}
        {upcomingRounds.map((round, index) => (
          <RoundItem
            key={`upcoming-round-${index}`}
            round={round}
            index={index}
            isExpanded={expandedUpcomingRoundIndex === index}
            isActual={false}
            isFirstUpcoming={index === 0}
            isWalkOwner={isWalkOwner}
            onToggleExpand={() => toggleUpcomingRoundExpanded(index)}
            onEditPrompt={() => handleEditPrompt(index)}
            onStartRound={index === 0 ? handleRotate : undefined}
            isRotating={isRotating}
          />
        ))}

        {/* Empty state */}
        {actualRounds.length === 0 && upcomingRounds.length === 0 && (
          <Text color="$gray9" textAlign="center" padding="$4">
            No rounds have been created for this walk yet.
          </Text>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
