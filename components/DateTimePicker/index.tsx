import { COLORS } from "@/styles/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Card, Text, View, YStack } from "tamagui";

interface Props {
  selectedDate: Date;
  selectedTime: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  minDate?: string;
  theme?: {
    selectedDayBackgroundColor?: string;
    todayTextColor?: string;
    arrowColor?: string;
  };
  showTimePickerLabel?: boolean;
  timePickerButtonColor?: string;
}

const DateTimePickerComponent: React.FC<Props> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate = new Date().toISOString().split("T")[0],
  theme = {
    selectedDayBackgroundColor: COLORS.primary,
    todayTextColor: COLORS.primary,
    arrowColor: COLORS.primary,
  },
  showTimePickerLabel = true,
  timePickerButtonColor = COLORS.primary,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isAndroid = Platform.OS === "android";

  const handleDateChange = (day: any) => {
    const newDate = new Date(day.timestamp);
    onDateChange(newDate);
  };

  const handleTimeChange = (_: any, selectedTimeValue?: Date) => {
    if (selectedTimeValue) {
      onTimeChange(selectedTimeValue);
    }
    setShowTimePicker(false);
  };

  return (
    <YStack gap="$3">
      {/* Calendar */}
      <Card backgroundColor="#f9f9f9" borderRadius={10} padding={10}>
        <View borderRadius={10} overflow="hidden" backgroundColor="white">
          <Calendar
            minDate={minDate}
            onDayPress={handleDateChange}
            theme={theme}
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
            <YStack alignItems="center" gap="$2">
              {showTimePickerLabel && (
                <Text fontSize="$3" fontWeight="500">
                  Selected Time:{" "}
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
              <Button
                backgroundColor={timePickerButtonColor}
                color="white"
                onPress={() => setShowTimePicker(true)}
                size="$3"
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
            </YStack>
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
    </YStack>
  );
};

export default DateTimePickerComponent;
