import { Clock, Plus, X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Input,
  SizableText,
  Slider,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useWalkForm } from "../../context/WalkFormContext";
import { COLORS } from "../../styles/colors";
import WizardWrapper from "./WizardWrapper";

interface DurationSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

export const DurationSelection: React.FC<DurationSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const [duration, setDuration] = useState(formData.duration || 30);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customHours, setCustomHours] = useState("0");
  const [customMinutes, setCustomMinutes] = useState("30");

  const durationOptions = [15, 30, 45, 60, 75, 90, 120];

  const handleDurationChange = (value: number) => {
    // Find the closest duration option
    const closest = durationOptions.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });

    setDuration(closest);
    updateFormData({ duration: closest });
  };

  const openCustomDurationPicker = () => {
    // Convert current duration to hours and minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    setCustomHours(hours.toString());
    setCustomMinutes(minutes.toString());
    setCustomModalOpen(true);
  };

  const saveCustomDuration = () => {
    let hours = parseInt(customHours) || 0;
    let minutes = parseInt(customMinutes) || 0;

    // Convert to total minutes
    const totalMinutes = hours * 60 + minutes;

    // Enforce minimum of 5 minutes and maximum of 180 minutes (3 hours)
    const sanitizedDuration = Math.max(5, Math.min(180, totalMinutes));

    setDuration(sanitizedDuration);
    updateFormData({ duration: sanitizedDuration });
    setCustomModalOpen(false);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return hours === 1 ? "1 hour" : `${hours} hours`;
      } else {
        return `${hours} hr ${remainingMinutes} min`;
      }
    }
  };

  // Define the continue handler to use with the WizardWrapper
  const handleContinue = () => {
    // Pass the duration data to the next step
    onContinue();
  };

  return (
    <>
      <WizardWrapper onContinue={handleContinue} onBack={onBack}>
        <YStack gap="$4">
          <View style={styles.durationContainer}>
            <XStack
              alignItems="center"
              justifyContent="center"
              marginBottom="$4"
            >
              <Clock size="$6" color={COLORS.textOnDark} />
              <Text
                fontSize={36}
                fontWeight="bold"
                color={COLORS.textOnDark}
                marginLeft="$2"
              >
                {formatDuration(duration)}
              </Text>
            </XStack>

            <View style={styles.sliderContainer}>
              <Slider
                size="$4"
                width="100%"
                defaultValue={[duration]}
                min={15}
                max={120}
                step={1}
                onValueChange={([value]) => handleDurationChange(value)}
                marginBottom="$8"
              >
                <Slider.Track backgroundColor="rgba(255,255,255,0.3)">
                  <Slider.TrackActive backgroundColor={COLORS.background} />
                </Slider.Track>
                <Slider.Thumb
                  index={0}
                  backgroundColor={COLORS.background}
                  circular
                  size="$5"
                />
              </Slider>

              <XStack justifyContent="space-between" width="100%">
                {durationOptions.map((option) => (
                  <View
                    key={option}
                    style={[
                      styles.durationOption,
                      duration === option && styles.selectedDuration,
                    ]}
                    onTouchEnd={() => handleDurationChange(option)}
                  >
                    <SizableText
                      size="$2"
                      color={COLORS.text}
                      fontWeight={duration === option ? "700" : "500"}
                    >
                      {option < 60 ? `${option}m` : `${option / 60}h`}
                    </SizableText>
                  </View>
                ))}
              </XStack>

              <TouchableOpacity
                style={styles.customDurationButton}
                onPress={openCustomDurationPicker}
              >
                <XStack
                  backgroundColor="white"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={20}
                  alignItems="center"
                >
                  <Plus size={16} color={COLORS.text} />
                  <Text color={COLORS.text} marginLeft="$1" fontWeight="500">
                    Custom Duration
                  </Text>
                </XStack>
              </TouchableOpacity>
            </View>
          </View>
        </YStack>
      </WizardWrapper>

      {/* Custom Duration Modal */}
      <Modal
        visible={customModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCustomModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCustomModalOpen(false)}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>

              <YStack gap="$4" padding="$5">
                <Text
                  fontWeight="bold"
                  fontSize={20}
                  textAlign="center"
                  color={COLORS.text}
                >
                  Set Custom Duration
                </Text>

                <XStack gap="$4" justifyContent="center" alignItems="center">
                  <YStack>
                    <Text
                      fontSize={16}
                      textAlign="center"
                      marginBottom="$1"
                      color={COLORS.text}
                    >
                      Hours
                    </Text>
                    <Input
                      value={customHours}
                      onChangeText={setCustomHours}
                      keyboardType="number-pad"
                      width={80}
                      textAlign="center"
                      fontSize={20}
                      color={COLORS.text}
                    />
                  </YStack>

                  <Text fontSize={24} marginTop="$2" color={COLORS.text}>
                    :
                  </Text>

                  <YStack>
                    <Text
                      fontSize={16}
                      textAlign="center"
                      marginBottom="$1"
                      color={COLORS.text}
                    >
                      Minutes
                    </Text>
                    <Input
                      value={customMinutes}
                      onChangeText={setCustomMinutes}
                      keyboardType="number-pad"
                      width={80}
                      textAlign="center"
                      fontSize={20}
                      color={COLORS.text}
                    />
                  </YStack>
                </XStack>

                <Button
                  backgroundColor={COLORS.action}
                  color={COLORS.textOnDark}
                  onPress={saveCustomDuration}
                  marginTop="$6"
                >
                  Set Duration
                </Button>
              </YStack>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 15,
  },
  container: {
    flex: 1,
  },
  durationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Slightly more contrast
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
  },
  sliderContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  durationOption: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  selectedDuration: {
    backgroundColor: "white",
  },
  spacer: {
    flex: 1,
  },
  customDurationButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default DurationSelection;
