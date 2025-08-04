import RoundCard from "@/components/RoundCard";
import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/utils/firestore";
import { startNextRound } from "@/utils/roundUtils";
import {
  collection,
  FirebaseFirestoreTypes,
  orderBy,
  query,
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

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Check if the walk has been started (has startedAt)
  const walkStarted = Boolean(walk.startedAt);

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
  const handleStartRound = async () => {
    if (!isWalkOwner || isRotating) return;

    setIsRotating(true);
    try {
      await startNextRound(walk);
    } catch (error) {
      console.error("Error starting round:", error);
    } finally {
      setIsRotating(false);
    }
  };

  // Start the round with the selected duration

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
            walkStarted={walkStarted}
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
            walkStarted={walkStarted}
            onToggleExpand={() => toggleUpcomingRoundExpanded(index)}
            onEditPrompt={undefined}
            onStartRound={index === 0 ? handleStartRound : undefined}
            isRotating={isRotating}
          />
        ))}

        {/* Empty state */}
        {actualRounds.length === 0 && upcomingRounds.length === 0 && (
          <YStack>
            <Text color="$gray9" textAlign="center" padding="$4">
              Once the walk starts, participants will be matched into pairs
              throughout the walk.
            </Text>
          </YStack>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
