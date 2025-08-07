import { useWalkForm } from "@/context/WalkFormContext";
import DateTimePickerComponent from "@/components/DateTimePicker";
import { COLORS } from "@/styles/colors";
import { combineDateAndTime } from "@/utils/timezone";
import { Timestamp } from "@react-native-firebase/firestore";
import { X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";

interface Props {
  onClose: () => void;
  editingTimeIndex?: number; // If editing an existing time option
  isSettingPrimaryTime?: boolean; // If setting the main walk time
}

export const TimeSelectionSheet: React.FC<Props> = ({
  onClose,
  editingTimeIndex,
  isSettingPrimaryTime = false,
}) => {
  const { formData, updateFormData } = useWalkForm();

  // Initialize with existing time if editing, otherwise use current date/time
  const existingTime = editingTimeIndex !== undefined
    ? (formData.timeOptions as any)?.[editingTimeIndex]?.toDate()
    : isSettingPrimaryTime
      ? formData.date?.toDate()
      : new Date();

  const initialDate = existingTime || new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      initialDate.getDate()
    )
  );
  const [selectedTime, setSelectedTime] = useState<Date>(
    new Date(1970, 0, 1, initialDate.getHours(), initialDate.getMinutes(), 0, 0)
  );

  // Initialize timeOptions from formData or empty array
  const timeOptions = (formData.timeOptions as any) || [];

  // Save the time (either as primary time or as time option)
  const handleSaveTime = () => {
    const combined = combineDateAndTime(selectedDate, selectedTime);
    const newTimestamp = Timestamp.fromDate(combined);

    if (isSettingPrimaryTime) {
      // Set as primary walk time
      updateFormData({ date: newTimestamp } as any);
    } else if (editingTimeIndex !== undefined) {
      // Update existing time option
      const updatedTimeOptions = [...timeOptions];
      updatedTimeOptions[editingTimeIndex] = newTimestamp;
      updateFormData({ timeOptions: updatedTimeOptions } as any);
    } else {
      // Add new time option
      const updatedTimeOptions = [...timeOptions, newTimestamp];
      updateFormData({ timeOptions: updatedTimeOptions } as any);
    }

    onClose();
  };

  // Remove time option (only for editing existing options)
  const handleRemoveTime = () => {
    if (editingTimeIndex !== undefined) {
      const updatedTimeOptions = timeOptions.filter((_: any, i: number) => i !== editingTimeIndex);
      updateFormData({ timeOptions: updatedTimeOptions } as any);
      onClose();
    }
  };

  const getTitle = () => {
    if (isSettingPrimaryTime) return "Set Walk Time";
    if (editingTimeIndex !== undefined) return "Edit Time Option";
    return "Add Time Option";
  };

  const getSaveButtonText = () => {
    if (isSettingPrimaryTime) return "Set as Walk Time";
    if (editingTimeIndex !== undefined) return "Update Time";
    return "Add Time Option";
  };

  return (
    <YStack padding="$4" gap="$4">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$6" fontWeight="600">
          {getTitle()}
        </Text>
        <Button
          size="$3"
          chromeless
          icon={<X size={20} />}
          onPress={onClose}
        />
      </XStack>

      <DateTimePickerComponent
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        theme={{
          selectedDayBackgroundColor: COLORS.action,
          todayTextColor: COLORS.action,
          arrowColor: COLORS.action,
        }}
        timePickerButtonColor={COLORS.action}
      />

      {/* Action Buttons */}
      <XStack gap="$3">
        {editingTimeIndex !== undefined && !isSettingPrimaryTime && (
          <Button
            flex={1}
            backgroundColor="$red9"
            color="white"
            onPress={handleRemoveTime}
          >
            Remove
          </Button>
        )}
        <Button
          flex={1}
          backgroundColor={COLORS.action}
          color="white"
          onPress={handleSaveTime}
        >
          {getSaveButtonText()}
        </Button>
      </XStack>
    </YStack>
  );
};

export default TimeSelectionSheet;
