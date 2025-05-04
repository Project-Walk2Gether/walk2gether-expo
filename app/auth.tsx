import { Check } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Label,
  Spacer,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { Slogan } from "../components/AnimatedLogo/Slogan";
import AnimatedLogo from "../components/AnimatedLogo/index";
import AuthScenicLayout from "../components/Auth/AuthScenicLayout";
import PhoneForm from "../components/Auth/Form/PhoneForm";
import TokenSignInForm from "../components/Auth/Form/TokenSignInForm";
import VerificationCodeForm, {
  VerificationSchema,
} from "../components/Auth/Form/VerificationCodeForm";
import { firestore_instance } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useInvitationFlow } from "../hooks/useInvitationFlow";
import { COLORS } from "../styles/colors";

const { width } = Dimensions.get("window");
const logoWidth = width * 0.7;

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    code?: string;
    referredByUid?: string;
  }>();
  const { signInWithPhoneCredential } = useAuth();
  const [verificationId, setVerificationId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Use our custom hook for invitation flow
  const {
    inviterData,
    acceptFriendship,
    setAcceptFriendship,
    loadingInvitation,
    invitationError,
    authMode,
    setAuthMode,
    handleCreateFriendship,
    getInvitationParams,
  } = useInvitationFlow();

  const handleVerificationCodeFormSubmit = async (
    values: VerificationSchema
  ) => {
    const userCredential = await signInWithPhoneCredential(
      verificationId,
      values.verificationCode
    );
    // Now, check if the user has a profile
    const userDataDoc = firestore_instance
      .collection("users")
      .doc(userCredential.user.uid);

    const hasData = (await userDataDoc.get()).exists;

    // If there was a friendship invitation and the user wants to accept it
    // Create friendship regardless of whether user has profile data
    if (params.referredByUid) {
      await handleCreateFriendship(userCredential.user.uid);
    }

    if (!hasData) {
      // If there's a referredByUid, pass it to the profile completion screen
      if (params.referredByUid) {
        const invitationParams = getInvitationParams();
        router.replace({
          pathname: "/onboarding/complete-your-profile",
          params: {
            referredByUid: invitationParams.referredByUid,
            acceptFriendship: invitationParams.acceptFriendship
              ? "true"
              : "false",
          },
        });
      } else {
        router.replace("/onboarding/complete-your-profile");
      }
    } else {
      router.replace("/walks/home");
    }
  };

  return (
    <AuthScenicLayout
      showLogo={
        <YStack mb="$6" width="100%" alignItems="center">
          <Text
            color="rgb(182, 219, 99)"
            fontWeight="bold"
            textTransform="uppercase"
          >
            PROJECT
          </Text>
          <AnimatedLogo width={logoWidth} />
          <Spacer h="$1" />
          <Slogan delay={4500} />
        </YStack>
      }
      scroll
      contentContainerStyle={{ paddingBottom: 180 }}
    >
      <YStack padding="$5">
        <Card
          backgroundColor="white"
          borderRadius="$4"
          padding="$4"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
          elevation={5}
        >
          {/* Title with or without profile picture */}
          {authMode === "token" ? (
            <Text
              fontSize={26}
              fontWeight="bold"
              color={COLORS.primary}
              textAlign="center"
              marginBottom="$2"
            >
              Token Authentication
            </Text>
          ) : verificationId ? (
            <Text
              fontSize={26}
              fontWeight="bold"
              color={COLORS.primary}
              textAlign="center"
              marginBottom="$2"
            >
              Enter confirmation code
            </Text>
          ) : authMode === "invitation" && inviterData ? (
            // Profile picture and title in an XStack
            <XStack
              gap="$2"
              justifyContent="center"
              alignItems="center"
              marginBottom="$2"
            >
              <Avatar circular size="$5">
                {inviterData.profilePicUrl ? (
                  <Avatar.Image src={inviterData.profilePicUrl} />
                ) : (
                  <Avatar.Fallback backgroundColor="$primary">
                    <Text color="white" fontWeight="700" fontSize={14}>
                      {inviterData.name.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>
              <Text fontSize={24} fontWeight="bold" color={COLORS.primary}>
                Join {inviterData.name} on Walk2Gether
              </Text>
            </XStack>
          ) : (
            <Text
              fontSize={26}
              fontWeight="bold"
              color={COLORS.primary}
              textAlign="center"
              marginBottom="$2"
            >
              Get Started
            </Text>
          )}

          <View mb="$1">
            {authMode === "token" ? (
              <TokenSignInForm
                token={params.token || ""}
                onCancel={() => {
                  setAuthMode("phone");
                  router.setParams({});
                }}
              />
            ) : authMode === "invitation" ? (
              loadingInvitation ? (
                <YStack ai="center" gap="$4" p="$4">
                  <Spinner size="large" color="$primary" />
                  <Text>Loading invitation details...</Text>
                </YStack>
              ) : invitationError ? (
                <YStack ai="center" gap="$4" p="$4">
                  <Text color="$red10">{invitationError}</Text>
                  <Button onPress={() => setAuthMode("phone")}>
                    Continue with phone
                  </Button>
                </YStack>
              ) : inviterData ? (
                <YStack ai="center" gap="$2" p="$4">
                  <Text fontSize={16} color="#666" textAlign="center">
                    Create an account to connect and start walking together.
                  </Text>

                  <XStack gap="$2" alignItems="center">
                    <Checkbox
                      id="accept-friendship"
                      size="$4"
                      checked={acceptFriendship}
                      onCheckedChange={(checked: any) =>
                        setAcceptFriendship(!!checked)
                      }
                      backgroundColor={acceptFriendship ? "$primary" : "$gray5"}
                    >
                      <Checkbox.Indicator>
                        <Check color="white" />
                      </Checkbox.Indicator>
                    </Checkbox>
                    <Label
                      htmlFor="accept-friendship"
                      fontSize="$4"
                      color="$gray11"
                      paddingLeft="$2"
                    >
                      Accept {inviterData.name}'s friendship request
                    </Label>
                  </XStack>

                  <PhoneForm
                    onPhoneVerified={(id, phone) => {
                      setVerificationId(id);
                      setPhoneNumber(phone);
                      setAuthMode("phone"); // Switch to phone verification mode
                    }}
                  />
                </YStack>
              ) : null
            ) : verificationId ? (
              <VerificationCodeForm
                goBack={() => setVerificationId("")}
                handleSubmit={handleVerificationCodeFormSubmit}
                phoneNumber={phoneNumber}
              />
            ) : (
              <PhoneForm
                onPhoneVerified={(id, phone) => {
                  setVerificationId(id);
                  setPhoneNumber(phone);
                }}
              />
            )}
          </View>
        </Card>
      </YStack>
    </AuthScenicLayout>
  );
}
