import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image } from "react-native";
import { Button, Text, YStack } from "tamagui";
import { COLORS } from "../styles/colors";

interface ProfilePicturePickerProps {
  profilePicUrl?: string;
  onChange: (url?: string) => void;
  disabled?: boolean;
}

export const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  profilePicUrl,
  onChange,
  disabled,
}) => {
  const [pickingImage, setPickingImage] = useState(false);

  const pickImage = async () => {
    try {
      setPickingImage(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } finally {
      setPickingImage(false);
    }
  };

  return (
    <YStack ai="center" width="100%">
      <YStack mb="$4" w="100%">
        <Text fontSize="$4" mb="$2">
          Profile Picture
        </Text>
        <Text fontSize={12}>
          Optional, but helps your neighbors get to know you before inviting you
          on a walk
        </Text>
      </YStack>

      <Button
        onPress={pickImage}
        disabled={pickingImage || disabled}
        backgroundColor={COLORS.primary}
        borderColor="$primary"
        borderWidth={2}
        borderRadius={100}
        padding={0}
        width={60}
        height={60}
        alignItems="center"
        justifyContent="center"
        mb={8}
      >
        {profilePicUrl ? (
          <Image
            source={{ uri: profilePicUrl }}
            style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 0 }}
          />
        ) : (
          <Text color="#fff" fontSize={30}>
            +
          </Text>
        )}
      </Button>
    </YStack>
  );
};

export default ProfilePicturePicker;
