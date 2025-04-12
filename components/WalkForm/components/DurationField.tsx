import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Button, Text, View } from "tamagui";

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
    <View>
      <Text style={styles.sectionTitle}>Duration</Text>
      <Button
        size="$4"
        onPress={() => setShowPicker(!showPicker)}
        icon={<Ionicons name="time-outline" size={18} />}
        theme="gray"
      >
        {formatDuration(value)}
      </Button>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hours</Text>
              <Picker
                selectedValue={Math.floor(value / 60)}
                style={styles.picker}
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
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minutes</Text>
              <Picker
                selectedValue={value % 60}
                style={styles.picker}
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
            </View>
          </View>

          <Button size="$4" onPress={() => setShowPicker(false)}>
            Done
          </Button>
        </View>
      )}

      {error && touched && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    width: 100,
    height: 120,
  },
});
