import { FormControl } from "@/components/FormControl";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import { Calendar, Clock } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";

interface DateTimeFieldProps {
  value: Timestamp;
  onChange: (date: Timestamp) => void;
  error?: string;
  touched?: boolean;
}

export default function DateTimeField({
  value,
  onChange,
  error,
  touched,
}: DateTimeFieldProps) {
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const date = value.toDate();

  const formatDate = (date: Timestamp) => {
    return date.toDate().toLocaleDateString();
  };

  const formatTime = (date: Timestamp) => {
    return date
      .toDate()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper function to open pickers
  const openPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
  };

  // Helper function to close all pickers
  const closePickers = () => {
    setPickerMode(null);
  };

  return (
    <FormControl label="Date & Time" error={error} touched={touched}>
      <YStack>
        <XStack gap="$2">
          <Button
            size="$4"
            onPress={() => openPicker("date")}
            icon={<Calendar size="$1" />}
            theme="gray"
          >
            {formatDate(value)}
          </Button>

          <Button
            size="$4"
            onPress={() => openPicker("time")}
            icon={<Clock size="$1" />}
            theme="gray"
          >
            {formatTime(value)}
          </Button>
        </XStack>

      {pickerMode === "date" && (
        <Card
          backgroundColor="white"
          padding="$5"
          borderRadius="$3"
          marginTop="$2"
        >
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const newDate = new Date(selectedDate);
                // Preserve the time from the existing date
                newDate.setHours(date.getHours());
                newDate.setMinutes(date.getMinutes());
                onChange(Timestamp.fromDate(newDate));
              }
              if (Platform.OS === "android") {
                closePickers();
              }
            }}
          />
          {Platform.OS === "ios" && (
            <Button size="$4" onPress={closePickers}>
              Done
            </Button>
          )}
        </Card>
      )}

      {pickerMode === "time" && (
        <Card
          backgroundColor="white"
          padding="$5"
          borderRadius="$3"
          marginTop="$2"
        >
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const newDate = new Date(selectedDate);
                // Preserve the date from the existing date
                newDate.setFullYear(date.getFullYear());
                newDate.setMonth(date.getMonth());
                newDate.setDate(date.getDate());
                onChange(Timestamp.fromDate(newDate));
              }
              if (Platform.OS === "android") {
                closePickers();
              }
            }}
          />
          {Platform.OS === "ios" && (
            <Button size="$4" onPress={closePickers}>
              Done
            </Button>
          )}
        </Card>
      )}

      </YStack>
    </FormControl>
  );
}
