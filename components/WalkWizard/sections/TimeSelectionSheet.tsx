import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { combineDateAndTime } from "@/utils/timezone";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import { X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Card, Text, View, XStack, YStack } from "tamagui";

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

  // Android-specific state for time picker
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isAndroid = Platform.OS === "android";

  // Initialize timeOptions from formData or empty array
  const timeOptions = (formData.timeOptions as any) || [];

  // Date picker handler
  const handleDateChange = (day: any) => {
    const newDate = new Date(day.timestamp);
    setSelectedDate(newDate);
  };

  // Time picker handler
  const handleTimeChange = (_: any, selectedTimeValue?: Date) => {
    if (selectedTimeValue) {
      setSelectedTime(selectedTimeValue);
    }
  };

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

      {/* Calendar */}
      <Card backgroundColor="#f9f9f9" borderRadius={10} padding={10}>
        <View borderRadius={10} overflow="hidden" backgroundColor="white">
          <Calendar
            minDate={new Date().toISOString().split("T")[0]}
            onDayPress={handleDateChange}
            theme={{
              selectedDayBackgroundColor: COLORS.action,
              todayTextColor: COLORS.action,
              arrowColor: COLORS.action,
            }}
            markedDates={{
              [selectedDate.toISOString().split("T")[0]]: {
                selected: true,
              },
            }}
          />
        </View>
      </Card>

      {/* Time Picker */}
      <Card backgroundColor="#f9f9f9" borderRadius={10} padding={10}>
        <View padding={10} alignItems="center">
          {isAndroid ? (
            <>
              <Text fontSize={16} fontWeight="500" marginBottom="$2">
                Selected Time:{" "}
                {selectedTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Button
                backgroundColor={COLORS.action}
                color="white"
                onPress={() => setShowTimePicker(true)}
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius={8}
              >
                Select Time
              </Button>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={false}
                  onChange={(event, selectedTimeValue) => {
                    setShowTimePicker(false);
                    handleTimeChange(event, selectedTimeValue);
                  }}
                  minuteInterval={5}
                />
              )}
            </>
          ) : (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              themeVariant="light"
              minuteInterval={5}
            />
          )}
        </View>
      </Card>

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
