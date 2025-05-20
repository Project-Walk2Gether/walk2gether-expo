import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { Card, Text, View, XStack, YStack } from "tamagui";
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
  const [timeOption, setTimeOption] = useState<"now" | "future">("future");

  const handleDateChange = (day: any) => {
    const selectedDate = new Date(day.timestamp);
    // Create a new timestamp preserving the current time
    const currentTime = formData.date?.toDate() || new Date();
    selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes());

    updateFormData({ date: Timestamp.fromDate(selectedDate) });
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (selectedTime) {
      // Create a new date with current date but updated time
      const currentDate = formData.date?.toDate() || new Date();
      currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());

      updateFormData({ date: Timestamp.fromDate(currentDate) });
    }
  };

  // Update to current time when the 'now' option is selected
  const handleNowOption = () => {
    if (timeOption === "now") {
      updateFormData({
        date: Timestamp.now(),
      });
    }
    setTimeOption("now");
  };

  const handleContinue = () => {
    // If 'now' is selected, update to current time one more time before continuing
    if (timeOption === "now") {
      updateFormData({
        date: Timestamp.now(),
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
              backgroundColor:
                timeOption === "now" ? COLORS.action : "transparent",
            }}
            onPress={handleNowOption}
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
              backgroundColor:
                timeOption === "future" ? COLORS.action : "transparent",
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
                  current={
                    (formData.date?.toDate() || new Date())
                      .toISOString()
                      .split("T")[0]
                  }
                  minDate={new Date().toISOString().split("T")[0]}
                  markedDates={{
                    [(formData.date?.toDate() || new Date())
                      .toISOString()
                      .split("T")[0]]: {
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
              <View
                backgroundColor="rgba(255, 255, 255, 0.95)"
                borderRadius={10}
                overflow="hidden"
              >
                <DateTimePicker
                  value={formData.date?.toDate() || new Date()}
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
