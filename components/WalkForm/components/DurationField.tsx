import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Button, Card, H4, Text, View, XStack, YStack } from "tamagui";

interface DurationFieldProps {
  value: number; // Duration in minutes
  onChange: (minutes: number) => void;
  error?: string;
  touched?: boolean;
}

export default function DurationField({
  value,
  onChange,
  error,
  touched,
}: DurationFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Generate options for hours (0-5)
  const hourOptions = Array.from({ length: 6 }, (_, i) => i);
  
  // Generate options for minutes (0, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45];

  return (
    <YStack>
      <H4 fontSize="$4" fontWeight="bold" marginBottom="$2">Duration</H4>
      <Button
        size="$4"
        onPress={() => setShowPicker(!showPicker)}
        icon={<Ionicons name="time-outline" size={18} />}
        theme="gray"
      >
        {formatDuration(value)}
      </Button>

      {showPicker && (
        <Card backgroundColor="white" padding="$5" borderRadius="$3" marginTop="$2">
          <XStack justifyContent="space-between" marginBottom="$5">
            <YStack flex={1} alignItems="center">
              <Text fontSize="$4" marginBottom="$2">Hours</Text>
              <Picker
                selectedValue={Math.floor(value / 60)}
                style={{ width: 100, height: 120 }}
                onValueChange={(itemValue) => {
                  const newHours = parseInt(itemValue.toString());
                  const currentMinutes = value % 60;
                  onChange(newHours * 60 + currentMinutes);
                }}
              >
                {hourOptions.map((hour) => (
                  <Picker.Item
                    key={hour}
                    label={hour.toString()}
                    value={hour}
                  />
                ))}
              </Picker>
            </YStack>

            <YStack flex={1} alignItems="center">
              <Text fontSize="$4" marginBottom="$2">Minutes</Text>
              <Picker
                selectedValue={value % 60}
                style={{ width: 100, height: 120 }}
                onValueChange={(itemValue) => {
                  const currentHours = Math.floor(value / 60);
                  const newMinutes = parseInt(itemValue.toString());
                  onChange(currentHours * 60 + newMinutes);
                }}
              >
                {minuteOptions.map((minute) => (
                  <Picker.Item
                    key={minute}
                    label={minute.toString()}
                    value={minute}
                  />
                ))}
              </Picker>
            </YStack>
          </XStack>

          <Button size="$4" onPress={() => setShowPicker(false)}>
            Done
          </Button>
        </Card>
      )}

      {error && touched && <Text color="red" fontSize="$2" marginTop="$1">{error}</Text>}
    </YStack>
  );
}

