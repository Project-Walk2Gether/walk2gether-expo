import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useWalk } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { Check, Clock, Users } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { Participant, WithId } from "walk2gether-shared";
import WalkDetailsCardBase from "../WalkDetailsCard";

interface Props {
  walkId: string;
  timeOptions: Timestamp[];
  participants: WithId<Participant>[];
  isWalkOwner: boolean;
  currentWalkTime: Timestamp;
}

export default function AlternateTimesCard({
  walkId,
  timeOptions,
  participants,
  isWalkOwner,
  currentWalkTime,
}: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  // Get current user's votes
  const currentUserParticipant = useMemo(() => {
    if (!user) return null;
    return participants.find((p) => p.userUid === user.uid);
  }, [participants, user]);

  const userTimeVotes = (currentUserParticipant as any)?.timeVotes || [];

  // Calculate vote counts for each time option
  const timeVoteCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    timeOptions.forEach((timeOption) => {
      const timeMillis = timeOption.toMillis();
      counts[timeMillis] = participants.filter((p) =>
        (p as any).timeVotes?.includes(timeMillis)
      ).length;
    });
    
    return counts;
  }, [timeOptions, participants]);

  // Handle voting on a time
  const handleVoteTime = async (timeOption: Timestamp) => {
    if (!user || !currentUserParticipant) return;

    const timeMillis = timeOption.toMillis();
    setLoading(timeMillis.toString());

    try {
      const isCurrentlyVoted = userTimeVotes.includes(timeMillis);
      const updatedVotes = isCurrentlyVoted
        ? userTimeVotes.filter((vote: number) => vote !== timeMillis)
        : [...userTimeVotes, timeMillis];

      const participantRef = doc(
        firestore_instance,
        "walks",
        walkId,
        "participants",
        user.uid
      );

      await setDoc(
        participantRef,
        {
          timeVotes: updatedVotes,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error voting on time:", error);
      Alert.alert("Error", "Failed to record your vote. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Handle setting a time as the official walk time
  const handleSetOfficialTime = async (timeOption: Timestamp) => {
    if (!isWalkOwner) return;

    setLoading(timeOption.toMillis().toString());

    try {
      const walkRef = doc(firestore_instance, "walks", walkId);
      
      await setDoc(
        walkRef,
        {
          date: timeOption,
        },
        { merge: true }
      );

      Alert.alert("Success", "Walk time updated successfully!");
    } catch (error) {
      console.error("Error updating walk time:", error);
      Alert.alert("Error", "Failed to update walk time. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  if (!timeOptions || timeOptions.length === 0) {
    return null;
  }

  return (
    <WalkDetailsCardBase title="Alternate Times" testID="alternate-times-card">
      <YStack gap="$2">
        <Text fontSize="$3" color="$gray11" marginBottom="$2">
          {isWalkOwner
            ? "Participants can vote on times they can make. Tap 'Set as official' to change the walk time."
            : "Vote on alternate times you can make it to."}
        </Text>
        
        {timeOptions.map((timeOption, index) => {
          const timeMillis = timeOption.toMillis();
          const voteCount = timeVoteCounts[timeMillis] || 0;
          const isVoted = userTimeVotes.includes(timeMillis);
          const isCurrentTime = timeOption.toMillis() === currentWalkTime.toMillis();
          const isLoadingThis = loading === timeMillis.toString();

          return (
            <Card
              key={index}
              backgroundColor={isCurrentTime ? "$green2" : "white"}
              borderColor={isCurrentTime ? "$green6" : "$gray6"}
              borderWidth={1}
              padding="$3"
              marginBottom="$2"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1}>
                  <XStack alignItems="center" gap="$2" marginBottom="$1">
                    <Clock size={16} color={isCurrentTime ? "$green10" : "$gray10"} />
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color={isCurrentTime ? "$green10" : "$gray12"}
                    >
                      {format(timeOption.toDate(), "EEEE, MMM d")}
                    </Text>
                    {isCurrentTime && (
                      <Text
                        fontSize="$2"
                        backgroundColor="$green9"
                        color="white"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius="$2"
                        fontWeight="600"
                      >
                        CURRENT
                      </Text>
                    )}
                  </XStack>
                  <Text
                    fontSize="$3"
                    color={isCurrentTime ? "$green10" : "$gray11"}
                    marginBottom="$1"
                  >
                    {format(timeOption.toDate(), "h:mm a")}
                  </Text>
                  <XStack alignItems="center" gap="$1">
                    <Users size={14} color="$gray10" />
                    <Text fontSize="$2" color="$gray10">
                      {voteCount} {voteCount === 1 ? "vote" : "votes"}
                    </Text>
                  </XStack>
                </YStack>

                <XStack gap="$2" alignItems="center">
                  {!isWalkOwner && !isCurrentTime && (
                    <Button
                      size="$3"
                      backgroundColor={isVoted ? "$green9" : "white"}
                      borderColor={isVoted ? "$green9" : "$gray6"}
                      borderWidth={1}
                      color={isVoted ? "white" : "$gray12"}
                      onPress={() => handleVoteTime(timeOption)}
                      disabled={isLoadingThis}
                      icon={isVoted ? <Check size={14} /> : undefined}
                    >
                      {isVoted ? "Voted" : "Can make it"}
                    </Button>
                  )}
                  
                  {isWalkOwner && !isCurrentTime && (
                    <Button
                      size="$3"
                      backgroundColor={COLORS.primary}
                      color="white"
                      onPress={() => handleSetOfficialTime(timeOption)}
                      disabled={isLoadingThis}
                    >
                      Set as official
                    </Button>
                  )}
                </XStack>
              </XStack>
            </Card>
          );
        })}
      </YStack>
    </WalkDetailsCardBase>
  );
}
