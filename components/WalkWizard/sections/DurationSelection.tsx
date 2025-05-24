import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { Clock, Plus, X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Card,
  Input,
  SizableText,
  Slider,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import WizardWrapper from "./WizardWrapper";
// Note: We're using the default export here (no named exports)

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const DurationSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const [duration, setDuration] = useState(formData.durationMinutes || 30);
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
    updateFormData({ durationMinutes: closest });
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

    // Enforce minimum of 5 minutes only
    const sanitizedDuration = Math.max(5, totalMinutes);

    setDuration(sanitizedDuration);
    updateFormData({ durationMinutes: sanitizedDuration });
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

  return (
    <>
      <WizardWrapper
        onContinue={onContinue}
        onBack={onBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
      >
        <YStack gap="$4">
          <Card
            backgroundColor="white"
            borderRadius="$4"
            padding="$5"
            alignItems="center"
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              marginBottom="$4"
            >
              <Clock size="$6" color={COLORS.primary} />
              <Text fontSize={36} fontWeight="bold" marginLeft="$2">
                {formatDuration(duration)}
              </Text>
            </XStack>

            <YStack width="100%" alignItems="center" marginTop="$5">
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
                <Slider.Track backgroundColor="rgba(100,100,100,0.1)">
                  <Slider.TrackActive backgroundColor={COLORS.primary} />
                </Slider.Track>
                <Slider.Thumb
                  index={0}
                  backgroundColor={COLORS.background}
                  circular
                  size="$5"
                />
              </Slider>

              <XStack gap="$2" flexWrap="wrap" justifyContent="center">
                {durationOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={{
                      backgroundColor:
                        duration === option ? COLORS.primary : "white",
                      padding: 10,
                      borderRadius: 20,
                      minWidth: 50,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor:
                        duration === option
                          ? COLORS.primary
                          : "rgba(0,0,0,0.1)",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 1,
                      elevation: 1,
                    }}
                    onPress={() => {
                      setDuration(option);
                      updateFormData({ durationMinutes: option });
                    }}
                  >
                    <SizableText
                      size="$2"
                      color={duration === option ? "white" : COLORS.text}
                      fontWeight={duration === option ? "700" : "500"}
                    >
                      {option < 60 ? `${option}m` : `${option / 60}h`}
                    </SizableText>
                  </TouchableOpacity>
                ))}
              </XStack>

              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                }}
                onPress={openCustomDurationPicker}
              >
                <XStack
                  backgroundColor="white"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={20}
                  alignItems="center"
                  borderWidth={1}
                  borderColor="rgba(0,0,0,0.1)"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={1}
                  elevation={1}
                >
                  <Plus size={16} color={COLORS.primary} />
                  <Text color={COLORS.primary} marginLeft="$1" fontWeight="600">
                    Custom Duration
                  </Text>
                </XStack>
              </TouchableOpacity>
            </YStack>
          </Card>
        </YStack>
      </WizardWrapper>

      {/* Custom Duration Modal */}
      <Modal
        visible={customModalOpen}
        // animationType="slide"
        transparent={true}
        onRequestClose={() => setCustomModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 30,
              }}
            >
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  padding: 15,
                }}
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

export default DurationSelection;
