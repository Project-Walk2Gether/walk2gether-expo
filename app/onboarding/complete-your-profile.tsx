// Screen for completing user profile after phone auth
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { Button, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import { userDataSchema } from "walk2gether-shared";
import BottomRow from "../../components/Auth/BottomRow";
import Clouds from "../../components/Clouds";
import Sun from "../../components/Sun";
import { BrandGradient } from "../../components/UI";
import { useUserData } from "../../context/UserDataContext";
import * as Location from 'expo-location';
import { useEffect } from 'react';
import AutoDetectLocation from '../../components/AutoDetectLocation';
import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function CompleteYourProfile() {
  const { updateUserData } = useUserData();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const placesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showLocationResults, setShowLocationResults] = useState(false);
  const [locationMode, setLocationMode] = useState<"none" | "auto" | "manual">(
    "none"
  );

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // Save user profile data
      await updateUserData({
        name: values.name,
        location: values.location,
      });
      router.replace("/");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandGradient style={{ flex: 1 }}>
      <Sun
        style={{
          position: "absolute",
          right: 0,
          top: 20,
          zIndex: 1,
        }}
      />
      <Clouds
        style={{
          position: "absolute",
          top: -100,
          left: 0,
          zIndex: 1,
        }}
      />
      <BottomRow />
      <Formik
        initialValues={{ name: "", location: null }}
        validationSchema={userDataSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, errors, touched, setFieldValue }) => (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            <YStack
              f={1}
              jc="center"
              ai="center"
              p="$6"
              space="$4"
              width="100%"
            >
              <Text fontSize="$6" fontWeight="bold">
                Complete your profile
              </Text>
              <Input
                placeholder="Your name"
                value={values.name}
                onChangeText={(text) => setFieldValue("name", text)}
                marginVertical="$3"
                width="$18"
                borderColor={touched.name && errors.name ? "$red10" : undefined}
              />
              {touched.name && errors.name && (
                <Text color="$red10" fontSize="$2" alignSelf="flex-start">
                  {errors.name}
                </Text>
              )}
              <YStack width="100%" space="$2">
                <Text fontWeight="bold" fontSize="$4" mb="$2">
                  Home Location
                </Text>
                {locationMode === "none" && (
                  <XStack space="$3" mb="$3" jc="center">
                    <Button
                      size="$4"
                      backgroundColor="$blue9"
                      color="white"
                      onPress={() => setLocationMode("auto")}
                    >
                      Share My Location
                    </Button>
                    <Button
                      size="$4"
                      variant="outlined"
                      onPress={() => setLocationMode("manual")}
                    >
                      Type My Location
                    </Button>
                  </XStack>
                )}
                {locationMode === "auto" && (
                  <YStack space="$2" ai="center">
                    <AutoDetectLocation
                      values={values}
                      setFieldValue={setFieldValue}
                      setLocationMode={setLocationMode}
                    />
                  </YStack>
                )}
                {locationMode === "manual" && (
                  <LocationAutocomplete
                    value={values.location}
                    setFieldValue={setFieldValue}
                    showLocationResults={showLocationResults}
                    setShowLocationResults={setShowLocationResults}
                    touched={touched}
                    errors={errors}
                    styles={styles}
                  />
                )}
              </YStack>

              <Button
                onPress={() => handleSubmit()}
                disabled={!values.name || !values.location}
                backgroundColor="$blue9"
                color="white"
                paddingVertical="$3"
                marginTop="$4"
                width="$15"
              >
                Save Profile
              </Button>
            </YStack>
          </ScrollView>
        )}
      </Formik>
    </BrandGradient>
  );
}

// StyleSheet definition for Google Places Autocomplete (these can't be done with Tamagui)
const styles = StyleSheet.create({
  placesInputContainer: {
    borderWidth: 0,
  },
  placesInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  placesList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 5,
    zIndex: 1000,
  },
  placesRow: {
    padding: 13,
    height: 50,
  },
  placesDescription: {
    fontSize: 14,
  },
});