import Clouds from "@/components/Clouds";
import Sun from "@/components/Sun";
import { appVersion } from "@/utils/version";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import PhoneInput from "react-native-phone-number-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";
import * as Yup from "yup";
import AnimatedLogo from "../components/AnimatedLogo";
import { BrandGradient } from "../components/UI";
import WalkingScene from "../components/WalkingScene";
import { useAuth } from "../context/AuthContext";

type AuthMode = "signin" | "signup";
type PhoneAuthStep = "phone_number" | "verification_code";

// Validation schemas
const signUpSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  location: Yup.object()
    .shape({
      name: Yup.string().required(),
      placeId: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
    })
    .nullable()
    .required("Location is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  formattedPhoneNumber: Yup.string().required(
    "Formatted phone number is required"
  ),
});

const signInSchema = Yup.object().shape({
  phoneNumber: Yup.string().required("Phone number is required"),
  formattedPhoneNumber: Yup.string().required(
    "Formatted phone number is required"
  ),
});

const verificationSchema = Yup.object().shape({
  verificationCode: Yup.string().required("Verification code is required"),
});

// Helper function to determine top padding based on screen height and auth mode
const getTopPadding = (screenHeight: number, authMode: AuthMode): number => {
  const isLargeScreen = screenHeight > 700; // Arbitrary threshold for large screen

  if (authMode === "signin") {
    return isLargeScreen ? 160 : 80;
  } else {
    // signup
    return 0;
  }
};

export default function Auth() {
  // Common state
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup"); // Default to signup, will update in useEffect

  // Get screen dimensions for responsive padding
  const { height: screenHeight } = Dimensions.get("window");

  // Location UI state
  const [showLocationResults, setShowLocationResults] = useState(false);

  // Auth state
  const [verificationId, setVerificationId] = useState("");
  const [phoneAuthStep, setPhoneAuthStep] =
    useState<PhoneAuthStep>("phone_number");
  const phoneInputRef = useRef<PhoneInput>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const placesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendPhoneVerificationCode, signInWithPhone } = useAuth();

  // Check if user has signed up before
  useEffect(() => {
    const checkHasSignedUp = async () => {
      try {
        const hasSignedUp = await AsyncStorage.getItem("hasSignedUp");
        if (hasSignedUp === "true") {
          setAuthMode("signin");
        }
      } catch (error) {
        console.error("Error checking signup status:", error);
      }
    };
    checkHasSignedUp();
  }, []);

  const handlePhoneAuth = async (values: any) => {
    if (phoneAuthStep === "phone_number") {
      try {
        setLoading(true);
        const id = await sendPhoneVerificationCode(values.formattedPhoneNumber);
        setVerificationId(id);
        setPhoneAuthStep("verification_code");
      } catch (error) {
        Alert.alert("Error", "Failed to send verification code");
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      // Verification code step
      try {
        setLoading(true);

        if (authMode === "signin") {
          // Sign in with phone
          await signInWithPhone(verificationId, values.verificationCode);
          router.replace("/");
        } else {
          // Sign up with phone
          await signInWithPhone(verificationId, values.verificationCode, {
            name: values.name,
            location: values.location,
          });

          // Save that the user has signed up before
          try {
            await AsyncStorage.setItem("hasSignedUp", "true");
          } catch (storageError) {
            console.error("Error saving signup status:", storageError);
          }

          router.replace("/");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to verify code");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (values: any) => {
    await handlePhoneAuth(values);
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    // Reset phone auth step when toggling between sign in and sign up
    setPhoneAuthStep("phone_number");
    setVerificationId("");
  };

  // Reset verification state when going back to phone number input
  const goBackToPhoneInput = () => {
    setPhoneAuthStep("phone_number");
  };

  return (
    <BrandGradient style={styles.gradientContainer}>
      <StatusBar style="dark" />
      <Sun
        style={{
          position: "absolute",
          right: 0,
          top: 20,
        }}
      />
      <Clouds
        style={{
          position: "absolute",
          top: -100,
          left: 0,
        }}
      />
      <View style={[styles.bottomContent, { bottom: insets.bottom + 20 }]}>
        <Text style={styles.subtitle}>Walk. Connect. Community.</Text>
        <Text textAlign="center" color="#999" w="100%">
          {"Version: " + appVersion}
        </Text>
      </View>
      <WalkingScene style={{ position: "absolute", bottom: 0, left: 0 }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContainer,
            {
              // Dynamic top padding based on screen size and auth mode
              paddingTop: insets.top + getTopPadding(screenHeight, authMode),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <YStack w="100%" gap="$2" alignItems="center">
              <Text style={styles.project}>PROJECT</Text>
              <AnimatedLogo width={240} height={80} />
            </YStack>

            <View style={styles.cardContainer}>
              <View style={styles.card}>
                {/* Card title */}
                {authMode === "signin" ? (
                  <Text style={styles.cardTitle}>Sign in</Text>
                ) : (
                  <Text style={styles.cardTitle}>Create Your Account</Text>
                )}

                <Formik
                  initialValues={{
                    name: "",
                    location: null,
                    phoneNumber: "",
                    formattedPhoneNumber: "",
                    verificationCode: "",
                  }}
                  validationSchema={
                    phoneAuthStep === "verification_code"
                      ? verificationSchema
                      : authMode === "signin"
                      ? signInSchema
                      : signUpSchema
                  }
                  onSubmit={handleSubmit}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    values,
                    errors,
                    touched,
                    isValid,
                  }) => (
                    <>
                      {/* Sign Up specific fields - only shown during the phone number input step */}
                      {authMode === "signup" &&
                        phoneAuthStep === "phone_number" && (
                          <View style={[styles.inputContainer]}>
                            <Text style={[styles.label, { marginBottom: 8 }]}>
                              Name
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                touched.name && errors.name
                                  ? styles.inputError
                                  : null,
                              ]}
                              placeholder="Enter your full name"
                              value={values.name}
                              onChangeText={handleChange("name")}
                              onBlur={handleBlur("name")}
                              placeholderTextColor="#999"
                            />
                            {touched.name && errors.name && (
                              <Text style={styles.errorText}>
                                {errors.name}
                              </Text>
                            )}
                          </View>
                        )}

                      {/* Location field (signup only) - only shown during the phone number input step */}
                      {authMode === "signup" &&
                        phoneAuthStep === "phone_number" && (
                          <View style={styles.inputContainer}>
                            <XStack mb="$2" alignItems="center">
                              <Text style={[styles.label, { flexGrow: 1 }]}>
                                Home Location
                              </Text>
                              <Button size="$3">Share my location</Button>
                            </XStack>
                            <GooglePlacesAutocomplete
                              ref={placesAutocompleteRef}
                              placeholder="Search for your city"
                              enablePoweredByContainer={false}
                              suppressDefaultStyles={false}
                              listViewDisplayed={showLocationResults}
                              currentLocation
                              currentLocationLabel="Use my current location"
                              enableHighAccuracyLocation={true}
                              onPress={(data, details) => {
                                if (details) {
                                  const locationData = {
                                    name: data.description,
                                    placeId: data.place_id || data.id,
                                    latitude:
                                      details.geometry?.location?.lat || 0,
                                    longitude:
                                      details.geometry?.location?.lng || 0,
                                  };
                                  setFieldValue("location", locationData);
                                } else {
                                  setFieldValue("location", null);
                                }

                                setShowLocationResults(false);
                                // Set the text in the input
                                setTimeout(() => {
                                  placesAutocompleteRef.current?.setAddressText(
                                    data.description
                                  );
                                  Keyboard.dismiss();
                                }, 100);
                              }}
                              textInputProps={{
                                onFocus: () => {
                                  setShowLocationResults(true);
                                  setTimeout(() => {
                                    scrollViewRef.current?.scrollToEnd({
                                      animated: true,
                                    });
                                  }, 100);
                                },
                                autoComplete: false,
                                onBlur: () => {
                                  // Delay hiding results so that onPress can fire first
                                  setTimeout(() => {
                                    if (values.location) {
                                      setShowLocationResults(false);
                                    }
                                  }, 200);
                                },
                              }}
                              query={{
                                key: "AIzaSyCVRcp8LoR83nVd-ur3kEQ6MdOYMBevHhk",
                                language: "en",
                                // types: "(cities)", // Only return cities
                              }}
                              styles={{
                                textInputContainer: styles.placesInputContainer,
                                textInput: [
                                  styles.placesInput,
                                  touched.location && errors.location
                                    ? styles.inputError
                                    : null,
                                ],
                                listView: styles.placesList,
                                row: styles.placesRow,
                                description: styles.placesDescription,
                              }}
                            />
                            {touched.location && errors.location && (
                              <Text style={styles.errorText}>
                                {errors.location}
                              </Text>
                            )}
                          </View>
                        )}

                      {/* Phone Authentication Fields */}
                      {phoneAuthStep === "phone_number" && (
                        <View style={styles.inputContainer}>
                          <PhoneInput
                            ref={phoneInputRef}
                            defaultValue={values.phoneNumber}
                            defaultCode="US"
                            layout="first"
                            onChangeText={(text) =>
                              setFieldValue("phoneNumber", text)
                            }
                            onChangeFormattedText={(text) =>
                              setFieldValue("formattedPhoneNumber", text)
                            }
                            textContainerStyle={{
                              backgroundColor: "#fff",
                              paddingHorizontal: 0,
                              paddingLeft: 0,
                              paddingVertical: 0,
                            }}
                            textInputStyle={[
                              styles.input,
                              touched.phoneNumber && errors.phoneNumber
                                ? styles.inputError
                                : null,
                            ]}
                            codeTextStyle={{
                              color: "#000",
                            }}
                          />
                          {touched.phoneNumber && errors.phoneNumber && (
                            <Text style={styles.errorText}>
                              {errors.phoneNumber}
                            </Text>
                          )}
                        </View>
                      )}

                      {phoneAuthStep === "verification_code" && (
                        <>
                          <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                              <Text style={styles.label}>
                                Verification Code
                              </Text>
                              <TouchableOpacity onPress={goBackToPhoneInput}>
                                <Text style={styles.changePhone}>
                                  Change phone
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <TextInput
                              style={[
                                styles.input,
                                touched.verificationCode &&
                                errors.verificationCode
                                  ? styles.inputError
                                  : null,
                              ]}
                              placeholder="Enter verification code"
                              value={values.verificationCode}
                              onChangeText={handleChange("verificationCode")}
                              onBlur={handleBlur("verificationCode")}
                              keyboardType="number-pad"
                              placeholderTextColor="#999"
                            />
                            {touched.verificationCode &&
                              errors.verificationCode && (
                                <Text style={styles.errorText}>
                                  {errors.verificationCode}
                                </Text>
                              )}
                          </View>
                        </>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.button,
                          !isValid && phoneAuthStep === "phone_number"
                            ? styles.buttonDisabled
                            : null,
                        ]}
                        onPress={() => handleSubmit()}
                        disabled={
                          loading ||
                          (phoneAuthStep === "phone_number" &&
                            (!values.phoneNumber ||
                              values.phoneNumber.trim() === ""))
                        }
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>
                            {authMode === "signin"
                              ? phoneAuthStep === "phone_number"
                                ? "Send Code"
                                : "Sign In"
                              : phoneAuthStep === "phone_number"
                              ? "Send Code"
                              : "Let's go!"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    {authMode === "signin"
                      ? "Don't have an account? "
                      : "Already have an account? "}
                  </Text>
                  <TouchableOpacity onPress={toggleAuthMode}>
                    <Text style={styles.footerLink}>
                      {authMode === "signin" ? "Sign Up" : "Sign In"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  gradientContainer: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  changePhone: {
    fontSize: 14,
    color: "#333333", // Updated to match app color scheme
    fontWeight: "500",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: -1,
  },
  project: {
    color: "rgb(42, 107, 84)",
    fontWeight: "bold",
    position: "relative",
    top: 12,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(60 42 24)",
    opacity: 0.9,
  },
  cardContainer: {
    padding: 20,
    width: "100%",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    paddingTop: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  activeToggleButton: {
    backgroundColor: "#333333", // Updated to match app color scheme
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeToggleButtonText: {
    color: "white",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
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
  placesList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 5,
  },
  placesRow: {
    padding: 13,
    height: 50,
  },
  placesDescription: {
    fontSize: 14,
  },
  button: {
    backgroundColor: "#4EB1BA",
    width: "100%",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  footerText: {
    color: "#333",
    fontSize: 16,
  },
  footerLink: {
    color: "#4EB1BA",
    fontSize: 16,
    fontWeight: "bold",
  },
  communityText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
    fontStyle: "italic",
  },
});
