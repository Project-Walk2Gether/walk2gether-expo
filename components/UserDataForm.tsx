import React, { useEffect, useRef, useState } from "react";
import { Input, Text, YStack } from "tamagui";
import { COLORS } from "../styles/colors";
import { ActionButton } from "./ActionButton";
import ProfilePicturePicker from "./ProfilePicturePicker";
import { PlaceData, PlacesAutocomplete } from "./UI/PlacesAutocomplete";

export interface UserDataFormProps {
  userData: {
    name?: string;
    aboutMe?: string;
    profilePicUrl?: string;
    location?: string | PlaceData | null;
  };
  onSave: (data: {
    name: string;
    aboutMe: string;
    location: PlaceData | null;
    profilePicUrl?: string;
  }) => void;
  isSaving?: boolean;
}

export const UserDataForm: React.FC<UserDataFormProps> = ({
  userData,
  onSave,
  isSaving,
}) => {
  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [location, setLocation] = useState<PlaceData | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(
    undefined
  );
  // Fix type error: useRef<GooglePlacesAutocompleteRef | null>(null)
  // If GooglePlacesAutocompleteRef is not imported, import it from the correct package
  const googlePlacesAutocompleteRef = useRef<any>(null);

  useEffect(() => {
    setName(userData.name || "");
    setAboutMe(userData.aboutMe || "");
    if (userData.location) {
      if (typeof userData.location === "string") {
        setLocation({
          name: userData.location,
          placeId: "",
          latitude: 0,
          longitude: 0,
        });
      } else {
        setLocation(userData.location as PlaceData);
      }
    } else {
      setLocation(null);
    }
    setProfilePicUrl(userData.profilePicUrl);
  }, [userData]);

  // ProfilePicturePicker will handle image picking

  const handleSave = () => {
    onSave({ name, aboutMe, location, profilePicUrl });
  };

  return (
    <YStack width="100%" gap="$4" mb="$4">
      <YStack width="100%" gap="$2">
        <Text fontWeight="500" fontSize="$4">
          Name
        </Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          width="100%"
          borderColor={COLORS.primary}
          backgroundColor={COLORS.background}
          color={COLORS.text}
          borderRadius={10}
          px={16}
          py={12}
          fontSize={18}
        />
      </YStack>
      <ProfilePicturePicker
        profilePicUrl={profilePicUrl}
        onChange={(url?: string) => setProfilePicUrl(url)}
        disabled={isSaving}
      />
      <YStack width="100%" gap="$2">
        <Text fontWeight="500" fontSize="$4">
          Location
        </Text>
        <PlacesAutocomplete
          value={location}
          ref={googlePlacesAutocompleteRef}
          onSelect={setLocation}
          placeholder="Enter your location"
          googleApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        />
      </YStack>
      <YStack width="100%" gap="$2">
        <Text fontWeight="500" fontSize="$4">
          About Me
        </Text>
        <Input
          value={aboutMe}
          onChangeText={setAboutMe}
          placeholder="Tell us about yourself"
          multiline
          width="100%"
          borderColor={COLORS.primary}
          backgroundColor={COLORS.background}
          color={COLORS.text}
          borderRadius={10}
          px={16}
          py={12}
          fontSize={18}
          height={100}
        />
      </YStack>
      <ActionButton onPress={handleSave} disabled={isSaving} loading={isSaving}>
        Save Profile
      </ActionButton>
    </YStack>
  );
};
