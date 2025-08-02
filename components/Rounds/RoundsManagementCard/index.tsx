import WalkMinimumMinutesForm from "@/components/WalkMinimumMinutesForm";
import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { HelpCircle, Info } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import {
  MeetupWalk,
  Round,
  Walk,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";
import EditRoundSheet from "../EditRoundSheet";
import QuestionPromptsForm from "../QuestionPromptsForm";
import RoundsList from "../RoundsList/RoundsList";
import { COLORS } from "./constants";

interface Props {
  walk: WithId<Walk>;
}

export default function RoundsManagementCard({ walk }: Props) {
  const { user } = useAuth();
  const { showSheet, hideSheet } = useSheet();

  // Check if the walk is a MeetupWalk
  const isMeetupWalk = walkIsMeetupWalk(walk);

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Handle editing actual rounds
  const handleEditActualRound = (round: WithId<Round>) => {
    showSheet(
      <EditRoundSheet round={round} onClose={hideSheet} onSave={hideSheet} />
    );
  };

  if (!isMeetupWalk) {
    return null;
  }

  const meetupWalk = walk as WithId<MeetupWalk>;

  return (
    <WalkDetailsCard
      title="Rounds"
      headerAction={
        <XStack gap="$2" alignItems="center">
          <Button
            size="$2"
            circular
            icon={<HelpCircle size={16} color="$gray10" />}
            transparent
            onPress={() => router.push("/(app)/(modals)/rounds-help")}
          />
        </XStack>
      }
    >
      <YStack space="$4" width="100%">
        {isWalkOwner && (
          <XStack gap="$2" alignItems="center">
            <Info size={16} color={COLORS.primary} />
            <Text fontSize="$2" color="$blue8">
              Only shown to you, the walk owner
            </Text>
          </XStack>
        )}

        {/* Question Prompts Section */}
        <QuestionPromptsForm walk={meetupWalk} />

        {/* Minimum Minutes Form */}
        <WalkMinimumMinutesForm walk={meetupWalk} />

        {/* Rounds List */}
        <RoundsList walk={walk} onEditActualRound={handleEditActualRound} />
      </YStack>
    </WalkDetailsCard>
  );
}
