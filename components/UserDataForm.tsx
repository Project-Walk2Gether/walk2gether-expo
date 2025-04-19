import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../styles/colors";
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
  const googlePlacesAutocompleteRef = useRef();

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
  }, [userData]);

  const handleSave = () => {
    onSave({ name, aboutMe, location });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />
      <Text style={styles.label}>Location</Text>
      <PlacesAutocomplete
        value={location}
        ref={googlePlacesAutocompleteRef}
        onSelect={setLocation}
        placeholder="Enter your location"
        googleApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      />
      <Text style={styles.label}>About Me</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={aboutMe}
        onChangeText={setAboutMe}
        placeholder="Tell us about yourself"
        multiline
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: COLORS.TEXT_LABEL,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.action,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  saveButtonText: {
    color: COLORS.textOnDark,
    fontSize: 16,
    fontWeight: "600",
  },
  locationName: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
    fontStyle: "italic",
  },
});
