import { useMenu } from "@/context/MenuContext";
import { COLORS } from "@/styles/colors";
import { Camera, ImagePlus } from "@tamagui/lucide-icons";
import * as Device from "expo-device";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert } from "react-native";
import { Button } from "tamagui";
import { 
  ImagePickerOption,
  pickImage
} from "../../utils/imageUpload";

export type MediaPickerButtonProps = {
  onMediaSelected: (assets: ImagePicker.ImagePickerAsset[]) => void;
  buttonSize?: string;
  iconSize?: string;
  buttonLabel?: string;
  customIcon?: React.ReactNode;
  menuTitle?: string;
};

/**
 * A reusable button component for media picking (photos/camera)
 */
export default function MediaPickerButton({
  onMediaSelected,
  buttonSize = "$3",
  iconSize = "$1.5",
  buttonLabel,
  customIcon,
  menuTitle = "Add Photos"
}: MediaPickerButtonProps) {
  const { showMenu } = useMenu();

  // Check if device has a camera
  const hasCamera =
    Device.isDevice && Device.deviceType !== Device.DeviceType.DESKTOP;

  const handleImagePicker = async (option: ImagePickerOption) => {
    try {
      const assets = await pickImage(option);
      if (assets.length > 0) {
        onMediaSelected(assets);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  return (
    <Button
      size={buttonSize as any}
      circular={!buttonLabel}
      backgroundColor={buttonLabel ? COLORS.primary : "transparent"}
      color={buttonLabel ? "white" : undefined}
      icon={customIcon || <ImagePlus size={iconSize as any} color={buttonLabel ? "white" : COLORS.primary} />}
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

        showMenu(menuTitle, menuItems);
      }}
    >
      {buttonLabel}
    </Button>
  );
}
