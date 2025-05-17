// Screen for completing user profile after phone auth
import { ActionButton } from "@/components/ActionButton";
import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import AutoDetectLocation from "@/components/AutoDetectLocation";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import LocationButton from "@/components/UI/LocationButton";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { ArrowRight, Keyboard as KeyboardIcon } from "@tamagui/lucide-icons";
import { Redirect } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, Input, ScrollView, Text, YStack } from "tamagui";
import { userDataSchema } from "walk2gether-shared";
import { useOnboarding } from "./_layout";

export default function CompleteYourProfile() {
  const { setUserData } = useUserData();
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { goToNextScreen, referralInfo } = useOnboarding();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [locationMode, setLocationMode] = useState<"none" | "auto" | "manual">(
    "none"
  );

  if (!user) return <Redirect href="/auth" />;

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Prepare the data to save
      const userData = {
        name: values.name,
        location: values.location,
      };

      // If we have referral info, add it to the user data
      if (referralInfo) {
        console.log("Including referral info in profile data:", referralInfo);
      }

      // Save user profile data
      await setUserData(userData);

      goToNextScreen();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log({ loading });

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
      <AuthScenicLayout scroll showSun={false} showTree={false}>
        <Formik
          initialValues={{
            name: user?.displayName || "",
            location: null,
            profilePicUrl: undefined,
          }}
          validationSchema={userDataSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, values, errors, touched, setFieldValue }) => (
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
                      Home Address
                    </Text>
                    {locationMode === "none" && (
                      <>
                        <LocationButton
                          onPress={() => setLocationMode("auto")}
                          f={1}
                        />
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
                      </>
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
                        touched={touched}
                        errors={errors}
                        includeChooseAnotherWayButton
                        onCancel={() => {
                          setLocationMode("none");
                        }}
                      />
                    )}
                  </YStack>
                  <ActionButton
                    onPress={() => handleSubmit()}
                    loading={loading}
                    disabled={!values.name || !values.location}
                    iconAfter={<ArrowRight />}
                    label="Get started"
                  />
                </YStack>
              </Card>
            </ScrollView>
          )}
        </Formik>
      </AuthScenicLayout>
    </>
  );
}
