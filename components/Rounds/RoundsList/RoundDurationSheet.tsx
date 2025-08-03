import DurationField from "@/components/WalkForm/components/DurationField";
import React, { useState } from "react";
import { Button, Text, YStack } from "tamagui";

interface Props {
  open: boolean;
  onClose: () => void;
  onStartRound: (durationMinutes: number) => void;
  defaultDuration?: number; // in minutes
}

export default function RoundDurationSheet({
  open,
  onClose,
  onStartRound,
  defaultDuration = 15,
}: Props) {
  const [duration, setDuration] = useState<number>(defaultDuration);

  const handleSubmit = () => {
    onStartRound(duration);
    onClose();
  };

  return (
    <YStack padding="$4" gap="$4">
      <Text fontSize="$5" fontWeight="bold" textAlign="center">
        Set Round Duration
      </Text>

      <Text color="$gray11" textAlign="center">
        Based on the remaining time and rounds, we suggest {defaultDuration}{" "}
        minutes, but you can adjust as needed.
      </Text>

      <DurationField
        value={duration}
        onChange={(minutes) => setDuration(minutes)}
      />

      <YStack gap="$2" marginTop="$2">
        <Button
          size="$4"
          theme="active"
          onPress={handleSubmit}
          pressStyle={{ opacity: 0.9 }}
        >
          Start the next round
        </Button>

        <Button
          size="$4"
          theme="gray"
          onPress={onClose}
          pressStyle={{ opacity: 0.9 }}
        >
          Cancel
        </Button>
      </YStack>
    </YStack>
  );
}
