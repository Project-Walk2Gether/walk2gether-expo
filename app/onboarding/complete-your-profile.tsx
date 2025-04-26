// Screen for completing user profile after phone auth
import {
  ArrowRight,
  Keyboard as KeyboardIcon,
  MapPin,
} from "@tamagui/lucide-icons";
import { Redirect, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import { userDataSchema } from "walk2gether-shared";
import AuthScenicLayout from "../../components/Auth/AuthScenicLayout";
import AutoDetectLocation from "../../components/AutoDetectLocation";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { COLORS } from "../../styles/colors";

export default function CompleteYourProfile() {
  const { setUserData } = useUserData();
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [showLocationResults, setShowLocationResults] = useState(false);
  const [locationMode, setLocationMode] = useState<"none" | "auto" | "manual">(
    "none"
  );
  const initialFriendInvitationCode = user!.uid
    .substring(0, 8)
    .split("")
    .reverse()
    .join("");

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // Save user profile data
      await setUserData({
        name: values.name,
        location: values.location,
        friendInvitationCode: values.friendInvitationCode,
      });
      router.replace("/");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Redirect href="/auth" />;

  return (
    <>
      <Button
        onPress={signOut}
        backgroundColor={COLORS.disabled}
        color={COLORS.textOnDark}
        position="absolute"
        top={insets.top}
        right={20}
        zIndex={10}
        size="$3"
        borderRadius={20}
        px={16}
        fontWeight="bold"
        elevation={2}
      >
        Sign Out
      </Button>
      <AuthScenicLayout
        scroll
        showSun={false}
        showBottomRow={false}
        showTree={false}
        showHouse
      >
        <Formik
          initialValues={{
            name: user?.displayName || "",
            location: null,
            friendInvitationCode: initialFriendInvitationCode,
            profilePicUrl: undefined,
          }}
          validationSchema={userDataSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting,
          }) => (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                padding: 16,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Card
                elevate
                bordered
                size="$4"
                width="100%"
                maxWidth={400}
                padding={24}
                marginVertical={32}
                backgroundColor={COLORS.card}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
                alignItems="center"
              >
                <YStack width="100%" gap="$3">
                  <Text
                    mb="$2"
                    textAlign="center"
                    fontSize="$6"
                    fontWeight="bold"
                  >
                    Complete your profile
                  </Text>

                  <Text fontWeight="bold" fontSize="$4" color={COLORS.primary}>
                    Your Full Name
                  </Text>
                  <Input
                    placeholder="E.g. John Smith"
                    value={values.name}
                    onChangeText={(text) => setFieldValue("name", text)}
                    width="100%"
                    borderColor={
                      touched.name && errors.name
                        ? COLORS.error
                        : COLORS.primary
                    }
                    backgroundColor={COLORS.background}
                    color={COLORS.text}
                    borderRadius={10}
                    px={16}
                    py={12}
                    fontSize={18}
                  />
                  {touched.name && errors.name && (
                    <Text color="$red10" fontSize="$2" alignSelf="flex-start">
                      {errors.name}
                    </Text>
                  )}

                  {touched.name && errors.name && (
                    <Text color="$red10" fontSize="$2" alignSelf="flex-start">
                      {errors.name}
                    </Text>
                  )}
                  <YStack width="100%" gap="$2">
                    <Text
                      fontWeight="bold"
                      fontSize="$4"
                      mb="$2"
                      color={COLORS.primary}
                    >
                      Home Location
                    </Text>
                    {locationMode === "none" && (
                      <XStack gap="$3" jc="center" width="100%">
                        <Button
                          size="$4"
                          backgroundColor="$blue9"
                          color="white"
                          bg={COLORS.primary}
                          onPress={() => setLocationMode("auto")}
                          f={1}
                          icon={<MapPin size={20} style={{ marginRight: 8 }} />}
                        >
                          Share
                        </Button>
                        <Button
                          size="$4"
                          variant="outlined"
                          onPress={() => setLocationMode("manual")}
                          f={2}
                          icon={
                            <KeyboardIcon
                              size={20}
                              style={{ marginRight: 8 }}
                            />
                          }
                        >
                          Enter manually
                        </Button>
                      </XStack>
                    )}
                    {locationMode === "auto" && (
                      <YStack space="$2" ai="center" width="100%">
                        <AutoDetectLocation
                          values={values}
                          setFieldValue={setFieldValue}
                          setLocationMode={setLocationMode}
                          clearLocation={() => {
                            setFieldValue("location", null);
                            setLocationMode("none");
                          }}
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
                        includeChooseAnotherWayButton
                        onCancel={() => {
                          console.log("Cancelling");
                          setLocationMode("none");
                        }}
                      />
                    )}
                  </YStack>
                  <Button
                    onPress={() => handleSubmit()}
                    disabled={!values.name || !values.location}
                    backgroundColor={
                      !values.name || !values.location
                        ? COLORS.disabled
                        : COLORS.primary
                    }
                    color={COLORS.textOnDark}
                    width="100%"
                    borderRadius={12}
                    fontWeight={600}
                    elevation={2}
                    fontSize={18}
                    opacity={!values.name || !values.location ? 0.6 : 1}
                    iconAfter={<ArrowRight />}
                  >
                    Get started
                  </Button>
                </YStack>
              </Card>
            </ScrollView>
          )}
        </Formik>
      </AuthScenicLayout>
    </>
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
