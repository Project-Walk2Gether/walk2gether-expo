import { Slogan } from "@/components/AnimatedLogo/Slogan";
import AnimatedLogo from "@/components/AnimatedLogo/index";
import { AuthCard } from "@/components/Auth/AuthCard";
import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import PhoneForm from "@/components/Auth/Form/PhoneForm";
import TokenSignInForm from "@/components/Auth/Form/TokenSignInForm";
import VerificationCodeForm, {
  VerificationSchema,
} from "@/components/Auth/Form/VerificationCodeForm";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useInvitationFlow } from "@/hooks/useInvitationFlow";
import { COLORS } from "@/styles/colors";
import { determineUserRoute, getUserDisplayName } from "@/utils/navigation";
import { Check } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions } from "react-native";
import {
  Avatar,
  Button,
  Checkbox,
  Label,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

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
  const { showMessage } = useFlashMessage();
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
  } = useInvitationFlow();

  const handleVerificationCodeFormSubmit = async (
    values: VerificationSchema
  ) => {
    const userCredential = await signInWithPhoneCredential(
      verificationId,
      values.verificationCode
    );

    // If there was a friendship invitation and the user wants to accept it
    // Create friendship regardless of whether user has profile data
    if (params.referredByUid) {
      await handleCreateFriendship(userCredential.user.uid);
    }

    // Determine the appropriate route based on user data
    const route = await determineUserRoute(userCredential.user.uid, {
      referredByUid: params.referredByUid,
    });

    // Show welcome message if going to the main app
    if (route === "/walks") {
      const displayName = await getUserDisplayName(userCredential.user.uid);
      showMessage(`Welcome back, ${displayName}!`, "success");
    }

    // Navigate to the appropriate route - handle both string and object route types
    // Using type assertion to avoid TypeScript complexities with expo-router
    router.replace(route as any);
  };

  return (
    <AuthScenicLayout
      isAnimated={true}
      showLogo={
        <YStack gap="$2" mb="$2" width="100%" alignItems="center">
          <Text
            color="rgb(182, 219, 99)"
            fontWeight="bold"
            textTransform="uppercase"
          >
            PROJECT
          </Text>
          <AnimatedLogo width={logoWidth} />
          <Slogan delay={10} />
        </YStack>
      }
      scroll
      contentContainerStyle={{ paddingBottom: 180 }}
    >
      <YStack padding="$5">
        <AuthCard
          title={
            authMode === "token" ? (
              "Token Authentication"
            ) : verificationId ? (
              "Verify Your Phone"
            ) : authMode === "invitation" && inviterData ? (
              <XStack gap="$2" justifyContent="center" alignItems="center">
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
              "Get Started"
            )
          }
        >
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

          <YStack alignItems="center" gap="$2">
            <Text mb="$2" fontSize="$1" color="$gray10" textAlign="center">
              By continuing, you agree to our
            </Text>
            <XStack alignItems="center" gap="$2">
              <Button
                size="$2"
                theme="blue"
                onPress={() => router.push("/auth/terms")}
              >
                Terms of Service
              </Button>
              <Text fontSize="$1" color="$gray10">
                and
              </Text>
              <Button
                size="$2"
                theme="blue"
                onPress={() => router.push("/auth/privacy")}
              >
                Privacy Policy
              </Button>
            </XStack>
          </YStack>
        </AuthCard>
      </YStack>
    </AuthScenicLayout>
  );
}
