import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { Card, Text, View, XStack, YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";
import useChangeEffect from "@/utils/useChangeEffect";
import { combineDateAndTime } from "@/utils/timezone";

interface TimeSelectionProps {
  onContinue: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const TimeSelection: React.FC<TimeSelectionProps> = ({
  onContinue,
  onBack,
  onSubmit,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const [timeOption, setTimeOption] = useState<"now" | "future">("future");

  // Local state for date and time (date-only and time-only)
  const initialDate = formData.date?.toDate() || new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate())
  );
  const [selectedTime, setSelectedTime] = useState<Date>(
    new Date(1970, 0, 1, initialDate.getHours(), initialDate.getMinutes(), 0, 0)
  );

  // Update formData.date (Firestore Timestamp) whenever date or time changes
  useChangeEffect(
    ([prevDate, prevTime]) => {
      if (timeOption === "future") {
        const combined = combineDateAndTime(selectedDate, selectedTime);
        updateFormData({ date: Timestamp.fromDate(combined) });
      }
    },
    [selectedDate, selectedTime, timeOption]
  );

  // Date picker only updates selectedDate
  const handleDateChange = (day: any) => {
    setSelectedDate(new Date(day.timestamp));
  };

  // Time picker only updates selectedTime
  const handleTimeChange = (_: any, selectedTimeValue?: Date) => {
    if (selectedTimeValue) {
      setSelectedTime(selectedTimeValue);
    }
  };

  // Update to current time when the 'now' option is selected
  const handleNowOption = () => {
    if (timeOption === "now") {
      updateFormData({
        date: Timestamp.fromDate(new Date()),
      });
    }
    setTimeOption("now");
  };

  const handleContinue = () => {
    if (timeOption === "now") {
      updateFormData({
        date: Timestamp.fromDate(new Date()),
      });
    }
    if (onSubmit) {
      onSubmit();
    } else if (onContinue) {
      onContinue();
    }
  };

  return (
    <WizardWrapper
      onContinue={handleContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueText="Continue"
    >
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
                  current={selectedDate.toISOString().split("T")[0]}
                  minDate={new Date().toISOString().split("T")[0]}
                  markedDates={{
                    [selectedDate.toISOString().split("T")[0]]: {
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
                  value={selectedTime}
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
