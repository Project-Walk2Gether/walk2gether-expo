import { useMenu } from "@/context/MenuContext";
import { COLORS } from "@/styles/colors";
import { Camera, ImagePlus, Send, X } from "@tamagui/lucide-icons";
import * as Device from "expo-device";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import {
  Button,
  Image,
  Input,
  ScrollView,
  Spinner,
  XStack,
  YStack,
} from "tamagui";
import { Attachment, Message, Round as RoundType } from "walk2gether-shared";
import {
  ImagePickerOption,
  pickImage,
  uploadMessageAttachments,
} from "../../utils/imageUpload";

type Props = {
  onSendMessage: (message: Partial<Message>) => void;
  keyboardVerticalOffset?: number;
  containerStyle?: any;
  chatId: string;
  senderId: string;
  onFocus?: () => void;
  activeRound?: RoundType | null;
};

export default function MessageForm({
  onSendMessage,
  keyboardVerticalOffset = 200,
  containerStyle = {},
  chatId,
  senderId,
  onFocus,
  activeRound,
}: Props) {
  const { showMenu } = useMenu();
  const [messageText, setMessageText] = useState("");
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  // Check if the device has a camera
  const hasCamera =
    Device.isDevice && Device.deviceType !== Device.DeviceType.DESKTOP;

  // Remove a specific image from the selection
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle selecting images
  const handleImagePicker = async (option: ImagePickerOption) => {
    try {
      const assets = await pickImage(option);
      if (assets.length > 0) {
        setSelectedImages((prev) => [...prev, ...assets]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleSendMessage = async () => {
    // Require either text or images to send a message
    if ((!messageText.trim() && selectedImages.length === 0) || isUploading)
      return;

    try {
      setIsUploading(true);

      // Upload attachments if there are any
      let attachments: Attachment[] = [];
      if (selectedImages.length > 0) {
        attachments = await uploadMessageAttachments(
          selectedImages,
          `messages/${chatId}/${senderId}`
        );
      }

      const message: Partial<Message> = {
        message: messageText.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      onSendMessage(message);
      setMessageText("");
      setSelectedImages([]);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[containerStyle]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={
        Platform.OS === "ios" ? keyboardVerticalOffset : 0
      }
    >
      <YStack backgroundColor="white">
        {/* Selected images preview */}
        {selectedImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            paddingHorizontal="$3"
            paddingTop="$3"
          >
            <XStack gap="$2">
              {selectedImages.map((image, index) => (
                <YStack key={index} position="relative">
                  <Image
                    source={{ uri: image.uri }}
                    width={80}
                    height={80}
                    borderRadius="$2"
                  />
                  <Button
                    position="absolute"
                    top={-8}
                    right={-8}
                    size="$2"
                    circular
                    backgroundColor="$gray5"
                    onPress={() => removeImage(index)}
                    icon={<X size="$1" color="$gray11" />}
                  />
                </YStack>
              ))}
            </XStack>
          </ScrollView>
        )}

        {/* Message input and buttons */}
        <XStack
          backgroundColor="white"
          padding="$3"
          pt={selectedImages.length > 0 ? "$2" : "$3"}
          alignItems="center"
          gap="$2"
        >
          <Button
            size="$3"
            circular
            backgroundColor="transparent"
            icon={<ImagePlus size="$1.5" color={COLORS.primary} />}
            onPress={() => {
              // Create menu items based on device capabilities
              const menuItems = [];

              // Only include camera option if device has a camera
              if (hasCamera) {
                menuItems.push({
                  label: "Take a photo",
                  icon: <Camera size="$1" />,
                  onPress: () => handleImagePicker("camera"),
                });
              }

              // Always include gallery option
              menuItems.push({
                label: "Select photos",
                icon: <ImagePlus size="$1" />,
                onPress: () => handleImagePicker("multiple"),
              });

              showMenu("Add Photos", menuItems);
            }}
          />

          <Input
            flex={1}
            placeholder={
              activeRound ? `Answer the question...` : "Type a message..."
            }
            value={messageText}
            onChangeText={setMessageText}
            backgroundColor={activeRound ? "$blue2" : "white"}
            borderWidth={1}
            borderColor={activeRound ? "$blue8" : "#e0e0e0"}
            borderRadius="$4"
            autoCapitalize="none"
            color={COLORS.text}
            paddingHorizontal="$3"
            paddingVertical="$2"
            onSubmitEditing={handleSendMessage}
            onFocus={onFocus}
            disabled={isUploading}
          />

          <Button
            size="$4"
            circular
            backgroundColor="#4EB1BA"
            onPress={handleSendMessage}
            disabled={
              (!messageText.trim() && selectedImages.length === 0) ||
              isUploading
            }
            icon={
              isUploading ? (
                <Spinner size="small" color="white" />
              ) : (
                <Send size="$1" color="white" />
              )
            }
            opacity={
              (!messageText.trim() && selectedImages.length === 0) ||
              isUploading
                ? 0.5
                : 1
            }
          />
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
