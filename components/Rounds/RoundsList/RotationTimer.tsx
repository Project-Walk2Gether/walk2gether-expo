import { Clock } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";
import { Round } from "walk2gether-shared";
import { COLORS } from "./constants";

interface Props {
  currentRound?: Round;
  isRotating: boolean;
  onRotate: () => void;
  hasRounds: boolean;
}

export const RotationTimer = ({
  currentRound,
  isRotating,
  onRotate,
  hasRounds,
}: Props) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isTimerPlaying, setIsTimerPlaying] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    if (!currentRound?.endTime) return;

    // Calculate remaining time in seconds
    const endTimeDate = currentRound.endTime.toDate();
    const now = new Date();
    const diffInSeconds = Math.max(
      0,
      Math.floor((endTimeDate.getTime() - now.getTime()) / 1000)
    );

    console.log({ diffInSeconds });

    setRemainingSeconds(diffInSeconds);
    setIsTimerPlaying(diffInSeconds > 0);
    setKey((prevKey) => prevKey + 1); // Reset the timer when the round changes
  }, [currentRound]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <YStack
      backgroundColor="$blue2"
      padding="$4"
      borderRadius="$4"
      marginBottom="$2"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$3" flex={1}>
          {remainingSeconds > 0 ? (
            <CountdownCircleTimer
              key={key}
              isPlaying={isTimerPlaying}
              duration={remainingSeconds}
              colors={["#004777", "#F7B801", "#A30000"]}
              colorsTime={[remainingSeconds, remainingSeconds / 2, 0]}
              size={50}
              strokeWidth={5}
            >
              {({ remainingTime }) => (
                <Text fontWeight="bold">{formatTime(remainingTime || 0)}</Text>
              )}
            </CountdownCircleTimer>
          ) : (
            <Clock size={18} color={COLORS.primary} />
          )}

          <Text>
            {remainingSeconds > 0
              ? "Next rotation in"
              : "Time to rotate pairs!"}
          </Text>
        </XStack>

        <Button
          backgroundColor="$blue8"
          color="white"
          onPress={onRotate}
          disabled={isRotating || !hasRounds}
          size="$3"
        >
          {isRotating ? <Spinner /> : "Rotate!"}
        </Button>
      </XStack>
    </YStack>
  );
};
