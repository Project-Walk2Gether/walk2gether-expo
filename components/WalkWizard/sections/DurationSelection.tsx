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
import CustomDurationModal from "../../CustomDurationModal";
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
    setCustomModalOpen(true);
  };

  const handleCustomDurationSave = (hours: number, minutes: number) => {
    // Convert to total minutes
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes > 0) {
      setDuration(totalMinutes);
      updateFormData({ durationMinutes: totalMinutes });
    }
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
        <YStack gap="$4" paddingHorizontal={16}>
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
      <CustomDurationModal
        visible={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onSave={handleCustomDurationSave}
        initialHours={Math.floor(duration / 60)}
        initialMinutes={duration % 60}
      />
    </>
  );
};

export default DurationSelection;
