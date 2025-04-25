import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { Text, View, XStack, YStack, Card, Button } from "tamagui";
import { useWalkForm } from "../../context/WalkFormContext";
import { COLORS } from "../../styles/colors";
import WizardWrapper from "./WizardWrapper";

interface TimeSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

export const TimeSelection: React.FC<TimeSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const [date, setDate] = useState(formData.date || new Date());
  const [time, setTime] = useState(formData.time || new Date());
  const [timeOption, setTimeOption] = useState<"now" | "future">("future");

  const handleDateChange = (day: any) => {
    const selectedDate = new Date(day.timestamp);
    setDate(selectedDate);
    updateFormData({ date: selectedDate });
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTime(selectedTime);
      updateFormData({ time: selectedTime });
    }
  };

  // Set date and time to now when the 'now' option is selected
  useEffect(() => {
    if (timeOption === "now") {
      const now = new Date();
      setDate(now);
      setTime(now);
      updateFormData({
        date: now,
        time: now,
      });
    }
  }, [timeOption]);

  const handleContinue = () => {
    // If 'now' is selected, use current time
    if (timeOption === "now") {
      const now = new Date();
      updateFormData({
        date: now,
        time: now,
      });
    } else {
      // Combine date and time into one Date object for future option
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(time.getHours(), time.getMinutes());
      updateFormData({
        date: combinedDateTime,
        time: combinedDateTime,
      });
    }
    onContinue();
  };

  return (
    <WizardWrapper onContinue={handleContinue} onBack={onBack}>
      <YStack gap="$4">
        {/* Time option tabs */}
        <XStack backgroundColor="white" borderRadius={12} overflow="hidden">
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: timeOption === "now" ? COLORS.action : "transparent"
            }}
            onPress={() => setTimeOption("now")}
          >
            <Text
              fontSize={16}
              fontWeight="600"
              color={timeOption === "now" ? "white" : COLORS.text}
            >
              Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: timeOption === "future" ? COLORS.action : "transparent"
            }}
            onPress={() => setTimeOption("future")}
          >
            <Text
              fontSize={16}
              fontWeight="600"
              color={timeOption === "future" ? "white" : COLORS.text}
            >
              At a future time
            </Text>
          </TouchableOpacity>
        </XStack>

        {timeOption === "now" ? (
          <Card backgroundColor="white" borderRadius={10} padding={15}>
            <Text fontSize={16} color="#555" textAlign="center">
              Your walk will begin right now!
            </Text>
            <Text fontSize={16} color="#555" marginTop="$2" textAlign="center">
              Current time:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Card>
        ) : (
          <>
            <Card backgroundColor="white" borderRadius={10} padding={15}>
              <View borderRadius={10} overflow="hidden" backgroundColor="white">
                <Calendar
                  onDayPress={handleDateChange}
                  current={date.toISOString().split("T")[0]}
                  minDate={new Date().toISOString().split("T")[0]}
                  markedDates={{
                    [date.toISOString().split("T")[0]]: {
                      selected: true,
                      selectedColor: COLORS.action,
                    },
                  }}
                  theme={{
                    todayTextColor: COLORS.action,
                    arrowColor: COLORS.action,
                    dotColor: COLORS.action,
                    selectedDayBackgroundColor: COLORS.action,
                    textDayFontWeight: "500",
                    textMonthFontWeight: "bold",
                    textDayHeaderFontWeight: "500",
                  }}
                />
              </View>
            </Card>

            <Card backgroundColor="white" borderRadius={10} padding={15}>
              <View backgroundColor="rgba(255, 255, 255, 0.95)" borderRadius={10} overflow="hidden">
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  themeVariant="light"
                  minuteInterval={5}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </>
        )}
      </YStack>
    </WizardWrapper>
  );
};

export default TimeSelection;
