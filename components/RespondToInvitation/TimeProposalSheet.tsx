import { COLORS } from "@/styles/colors";
import DateTimePickerComponent from "@/components/DateTimePicker";
import { Clock } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";

interface Props {
  onProposeTime: (date: Date, time: Date) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const TimeProposalSheet: React.FC<Props> = ({
  onProposeTime,
  onClose,
  loading = false,
}) => {
  const [proposedDate, setProposedDate] = useState<Date>(new Date());
  const [proposedTime, setProposedTime] = useState<Date>(new Date());

  const handleProposeNewTime = async () => {
    await onProposeTime(proposedDate, proposedTime);
  };

  return (
    <YStack flex={1} padding="$4" gap="$4">
      <DateTimePickerComponent
        selectedDate={proposedDate}
        selectedTime={proposedTime}
        onDateChange={setProposedDate}
        onTimeChange={setProposedTime}
        theme={{
          selectedDayBackgroundColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
        }}
        timePickerButtonColor={COLORS.primary}
      />

      <XStack gap="$2">
        <Button
          flex={1}
          backgroundColor="$gray6"
          color="$gray12"
          onPress={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          flex={1}
          backgroundColor={COLORS.primary}
          color="white"
          onPress={handleProposeNewTime}
          disabled={loading}
          iconAfter={loading ? undefined : <Clock color="white" />}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            "Propose Time"
          )}
        </Button>
      </XStack>
    </YStack>
  );
};

export default TimeProposalSheet;
