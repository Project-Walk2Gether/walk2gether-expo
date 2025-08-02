import RoundCard from "@/components/RoundCard";
import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/utils/firestore";
import firestore, {
  collection,
  FirebaseFirestoreTypes,
  orderBy,
  query,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";
import { HelpCircle } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Button, Text, YStack } from "tamagui";
import {
  MeetupWalk,
  Round,
  Walk,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  onEditActualRound?: (round: WithId<Round>) => void;
}

export default function RoundsList({ walk, onEditActualRound }: Props) {
  const { user } = useAuth();
  const [expandedActualRoundId, setExpandedActualRoundId] = useState<
    string | null
  >(null);
  const [expandedUpcomingRoundIndex, setExpandedUpcomingRoundIndex] = useState<
    number | null
  >(null);
  const [isRotating, setIsRotating] = useState(false);

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

  // Handle editing the prompt for an actual round
  const handleEditActualRound = (round: WithId<Round>) => {
    if (onEditActualRound) {
      onEditActualRound(round);
    }
  };

  // Handle rotating to the next round - starts the round immediately
  const handleRotate = async () => {
    if (!walk._ref || !isMeetupWalk) return;

    setIsRotating(true);

    try {
      const meetupWalk = walk as WithId<MeetupWalk>;
      const nextRound = upcomingRounds[0];

      if (!nextRound) {
        console.log("No upcoming rounds to start");
        return;
      }

      // Calculate duration from backend timestamps or fallback to minimum
      let durationMinutes =
        meetupWalk.minimumNumberOfMinutesWithEachPartner || 5;

      if (nextRound.startTime && nextRound.endTime) {
        const startTime = nextRound.startTime.toDate();
        const endTime = nextRound.endTime.toDate();
        durationMinutes = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        );
      }

      await startRoundWithDuration(durationMinutes);
    } catch (error) {
      console.error("Error starting round:", error);
    } finally {
      setIsRotating(false);
    }
  };

  // Start the round with the selected duration
  const startRoundWithDuration = async (durationMinutes: number) => {
    if (!walk._ref || !isMeetupWalk) return;

    try {
      const meetupWalk = walk as WithId<MeetupWalk>;
      const nextRound = upcomingRounds[0];

      if (!nextRound) {
        console.log("No upcoming rounds to start");
        return;
      }

      // Create the round document in Firestore
      const roundsCollection = collection(
        walk._ref as unknown as FirebaseFirestoreTypes.DocumentReference<Walk>,
        "rounds"
      );

      const roundData: Omit<Round, "id"> = {
        roundNumber: nextRound.roundNumber,
        pairs: nextRound.pairs,
        questionPrompt: nextRound.questionPrompt,
        walkId: walk.id,
        startTime: Timestamp.now(),
        endTime: Timestamp.fromDate(
          new Date(Date.now() + durationMinutes * 60 * 1000)
        ),
      };

      await firestore().runTransaction(async (transaction) => {
        // Add the round document
        const roundRef = firestore().collection("temp").doc(); // Get a new doc reference
        transaction.set(
          firestore()
            .collection("walks")
            .doc(walk.id)
            .collection("rounds")
            .doc(roundRef.id),
          roundData
        );

        // Remove the first upcoming round and update the walk
        const updatedUpcomingRounds = [...upcomingRounds];
        updatedUpcomingRounds.shift();

        transaction.update(walk._ref as any, {
          upcomingRounds: updatedUpcomingRounds,
        });
      });

      console.log("Round started successfully");
    } catch (error) {
      console.error("Error starting round:", error);
      throw error;
    }
  };

  // Toggle expanded state for actual rounds
  const toggleActualRoundExpanded = (roundId: string) => {
    setExpandedActualRoundId(
      expandedActualRoundId === roundId ? null : roundId
    );
  };

  // Toggle expanded state for upcoming rounds
  const toggleUpcomingRoundExpanded = (index: number) => {
    setExpandedUpcomingRoundIndex(
      expandedUpcomingRoundIndex === index ? null : index
    );
  };

  return (
    <WalkDetailsCard
      title="Rounds"
      headerAction={
        <Button
          mt="$2"
          size="$2"
          theme="blue"
          iconAfter={<HelpCircle size={16} />}
          onPress={() => router.push("/(modals)/rounds-help" as any)}
        >
          Help
        </Button>
      }
    >
      <YStack gap="$3" width="100%">
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
            onEditPrompt={undefined}
            onStartRound={index === 0 ? handleRotate : undefined}
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
          </YStack>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
