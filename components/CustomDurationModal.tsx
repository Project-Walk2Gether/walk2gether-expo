import { COLORS } from "@/styles/colors";
import { X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Button, Input, Text, View, XStack, YStack } from "tamagui";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (hours: number, minutes: number) => void;
  initialHours?: number;
  initialMinutes?: number;
}

export const CustomDurationModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialHours = 0,
  initialMinutes = 0,
}) => {
  const [customHours, setCustomHours] = useState(initialHours.toString());
  const [customMinutes, setCustomMinutes] = useState(initialMinutes.toString());

  const handleSave = () => {
    const hours = parseInt(customHours) || 0;
    const minutes = parseInt(customMinutes) || 0;
    
    // Validate input
    if (hours < 0 || hours > 23) {
      // Could add error handling here
      return;
    }
    
    if (minutes < 0 || minutes > 59) {
      // Could add error handling here
      return;
    }
    
    if (hours === 0 && minutes === 0) {
      // Could add error handling here
      return;
    }
    
    onSave(hours, minutes);
    onClose();
  };

  const handleClose = () => {
    // Reset to initial values when closing
    setCustomHours(initialHours.toString());
    setCustomMinutes(initialMinutes.toString());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={handleClose}
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
              onPress={handleClose}
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
                    placeholder="0"
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
                    placeholder="0"
                  />
                </YStack>
              </XStack>

              <Button
                backgroundColor={COLORS.action}
                color={COLORS.textOnDark}
                onPress={handleSave}
                marginTop="$6"
              >
                Set Duration
              </Button>
            </YStack>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CustomDurationModal;
