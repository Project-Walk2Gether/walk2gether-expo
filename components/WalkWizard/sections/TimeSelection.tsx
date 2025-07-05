import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { combineDateAndTime } from "@/utils/timezone";
import useChangeEffect from "@/utils/useChangeEffect";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Card, Text, View, XStack, YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const TimeSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  onSubmit,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();
  // Determine if this is a friends walk or neighborhood walk
  const isFriendsWalk = formData.type === "friends";
  const [timeOption, setTimeOption] = useState<"now" | "future">("future");

  // Local state for date and time (date-only and time-only)
  const initialDate = formData.date?.toDate() || new Date();
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

  // Update formData.date (Firestore Timestamp) whenever date or time changes
  useChangeEffect(() => {
    if (timeOption === "future") {
      console.log("useChangeEffect triggered with:");
      console.log("selectedDate:", selectedDate.toISOString());
      console.log("selectedTime:", selectedTime.toISOString());
      console.log("timeOption:", timeOption);
      const combined = combineDateAndTime(selectedDate, selectedTime);
      console.log("Combined date and time:", combined.toISOString());
      updateFormData({ date: Timestamp.fromDate(combined) });
      console.log("Updated formData.date with timestamp");
    }
  }, [selectedDate, selectedTime, timeOption]);

  // Date picker only updates selectedDate
  const handleDateChange = (day: any) => {
    console.log("Creating new date from timestamp");
    const newDate = new Date(day.timestamp);
    console.log("New date object:", newDate.toISOString());
    setSelectedDate(newDate);
    console.log("selectedDate after update:", newDate.toISOString());
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
        {/* Only show time option tabs for neighborhood walks */}
        {!isFriendsWalk && (
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
        )}

        {/* Calendar and time picker */}
        {isFriendsWalk || timeOption === "future" ? (
          <>
            <Card backgroundColor="white" borderRadius={10} padding={10}>
              <View borderRadius={10} overflow="hidden" backgroundColor="white">
                <Calendar
                  minDate={new Date().toISOString().split("T")[0]}
                  onDayPress={(day) => {
                    handleDateChange(day);
                  }}
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

            <Card backgroundColor="white" borderRadius={10} padding={10}>
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
          </>
        ) : (
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
        )}
      </YStack>
    </WizardWrapper>
  );
};

export default TimeSelection;
