import { COLORS } from "@/styles/colors";
import { Timestamp } from "@react-native-firebase/firestore";
import { Check, Clock, X } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import React from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";

interface TimeOptionWithVotes {
  time: Timestamp;
  votes: Record<string, boolean>; // uid -> boolean (can make it / can't make it)
}

interface Props {
  timeOptions: TimeOptionWithVotes[];
  currentUserUid: string;
  onVote: (timeIndex: number, canMakeIt: boolean) => void;
  isParticipant?: boolean; // If false, shows admin view with vote counts
}

export const TimeOptionVoting: React.FC<Props> = ({
  timeOptions,
  currentUserUid,
  onVote,
  isParticipant = true,
}) => {
  // Get vote counts for a time option
  const getVoteCounts = (timeOption: TimeOptionWithVotes) => {
    const votes = Object.values(timeOption.votes || {});
    const canMake = votes.filter(vote => vote === true).length;
    const cantMake = votes.filter(vote => vote === false).length;
    return { canMake, cantMake, total: votes.length };
  };

  // Get current user's vote for a time option
  const getUserVote = (timeOption: TimeOptionWithVotes): boolean | null => {
    return timeOption.votes?.[currentUserUid] ?? null;
  };

  if (timeOptions.length === 0) {
    return null;
  }

  return (
    <YStack space="$3">
      <Text fontSize={18} fontWeight="600">
        {isParticipant ? "Vote on Time Options" : "Time Option Votes"}
      </Text>
      
      {timeOptions.map((timeOption, index) => {
        const voteCounts = getVoteCounts(timeOption);
        const userVote = getUserVote(timeOption);
        
        return (
          <Card key={index} padding="$3" backgroundColor="$gray1">
            <YStack space="$3">
              {/* Time display */}
              <XStack alignItems="center" space="$3">
                <Clock size={20} color="$gray10" />
                <YStack flex={1}>
                  <Text fontSize={16} fontWeight="600">
                    {format(timeOption.time.toDate(), "EEEE, MMMM d")}
                  </Text>
                  <Text fontSize={14} color="$gray10">
                    {format(timeOption.time.toDate(), "h:mm a")}
                  </Text>
                </YStack>
              </XStack>

              {/* Vote counts (always visible) */}
              {voteCounts.total > 0 && (
                <XStack space="$4">
                  <XStack alignItems="center" space="$2">
                    <Check size={16} color="$green10" />
                    <Text fontSize={14} color="$green10">
                      {voteCounts.canMake} can make it
                    </Text>
                  </XStack>
                  <XStack alignItems="center" space="$2">
                    <X size={16} color="$red10" />
                    <Text fontSize={14} color="$red10">
                      {voteCounts.cantMake} can't make it
                    </Text>
                  </XStack>
                </XStack>
              )}

              {/* Voting buttons (only for participants) */}
              {isParticipant && (
                <XStack space="$3">
                  <Button
                    flex={1}
                    size="$3"
                    backgroundColor={userVote === true ? "$green9" : "$gray3"}
                    color={userVote === true ? "white" : "$gray11"}
                    onPress={() => onVote(index, true)}
                    icon={<Check size={16} />}
                  >
                    Can make it
                  </Button>
                  <Button
                    flex={1}
                    size="$3"
                    backgroundColor={userVote === false ? "$red9" : "$gray3"}
                    color={userVote === false ? "white" : "$gray11"}
                    onPress={() => onVote(index, false)}
                    icon={<X size={16} />}
                  >
                    Can't make it
                  </Button>
                </XStack>
              )}

              {/* Admin view: detailed vote breakdown */}
              {!isParticipant && voteCounts.total > 0 && (
                <YStack space="$2">
                  <Text fontSize={14} fontWeight="600" color="$gray11">
                    Vote Details:
                  </Text>
                  {Object.entries(timeOption.votes || {}).map(([uid, vote]) => (
                    <XStack key={uid} alignItems="center" space="$2">
                      {vote ? (
                        <Check size={14} color="$green10" />
                      ) : (
                        <X size={14} color="$red10" />
                      )}
                      <Text fontSize={12} color="$gray10">
                        User {uid.slice(-4)} {vote ? "can make it" : "can't make it"}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>
          </Card>
        );
      })}
    </YStack>
  );
};

export default TimeOptionVoting;
