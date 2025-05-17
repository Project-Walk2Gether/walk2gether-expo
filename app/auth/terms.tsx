import { X } from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, ScrollView } from "react-native";
import {
  Button,
  H2,
  H3,
  Paragraph,
  Spacer,
  Text,
  XStack,
  YStack,
} from "tamagui";

const { width } = Dimensions.get("window");

export default function TermsOfService() {
  const router = useRouter();

  return (
    <YStack flex={1} bg="$background">
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="$backgroundStrong"
      >
        <H2 color="$color">Terms of Service</H2>
        <Button
          size="$3"
          circular
          icon={<X size={18} />}
          onPress={() => router.back()}
        />
      </XStack>

      <ScrollView>
        <YStack padding="$4" gap="$4" width={width}>
          <Text color="$gray11" fontSize="$2">
            Effective Date: May 11, 2025
          </Text>

          <YStack gap="$2">
            <Paragraph>
              Welcome to Walk2Gether! These Terms of Service ("Terms") govern
              your access to and use of the Walk2Gether mobile app, website, and
              related services (collectively, the "Service"), provided by
              Walk2Gether Inc. ("we," "our," or "us").
            </Paragraph>
            <Paragraph>
              By using the Service, you agree to be bound by these Terms. If you
              do not agree, please do not use the Service.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>1. Eligibility</H3>
            <Paragraph>
              You must be at least 13 years old to use the Service. If you are
              under 18, you must have permission from a parent or legal
              guardian.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>2. Your Account</H3>
            <Paragraph>
              To use certain features, you may need to create an account. You
              are responsible for maintaining the confidentiality of your
              account and for all activity that occurs under your account. You
              agree to provide accurate and complete information and to keep it
              up to date.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>3. Acceptable Use</H3>
            <Paragraph>You agree not to use the Service to:</Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>• Violate any laws or regulations;</Paragraph>
              <Paragraph>• Harass, harm, or impersonate others;</Paragraph>
              <Paragraph>
                • Share inappropriate, violent, or offensive content;
              </Paragraph>
              <Paragraph>• Post misleading or false information;</Paragraph>
              <Paragraph>• Interfere with or disrupt the Service.</Paragraph>
            </YStack>
            <Paragraph>
              We reserve the right to suspend or terminate your account if you
              violate these rules.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>4. Community Conduct and Safety</H3>
            <Paragraph>
              Walk2Gether is designed to bring people together through walking.
              You are solely responsible for your interactions with others. Use
              caution when meeting people in person and always follow local laws
              and safety guidelines. We are not responsible for any harm
              resulting from user interactions.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>5. Location and Data Use</H3>
            <Paragraph>
              Walk2Gether uses location data to facilitate walks and help you
              connect with others nearby. By using the app, you consent to our
              collection and use of location and personal data as described in
              our Privacy Policy.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>6. Intellectual Property</H3>
            <Paragraph>
              All content and materials in the Service (excluding user-generated
              content) are the property of Walk2Gether Inc. or its licensors.
              You may not use, copy, or distribute any part of the Service
              without our prior written consent.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>7. Termination</H3>
            <Paragraph>
              We may suspend or terminate your access to the Service at any
              time, with or without notice, for any reason, including violation
              of these Terms.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>8. Disclaimers</H3>
            <Paragraph>
              The Service is provided "as is" and "as available" without
              warranties of any kind. We do not guarantee that the Service will
              be safe, secure, or error-free.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>9. Limitation of Liability</H3>
            <Paragraph>
              To the maximum extent permitted by law, Walk2Gether Inc. is not
              liable for any indirect, incidental, or consequential damages
              arising from your use of the Service.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>10. Governing Law</H3>
            <Paragraph>
              These Terms are governed by the laws of the State of California,
              without regard to its conflict of laws rules.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>11. Changes to These Terms</H3>
            <Paragraph>
              We may update these Terms from time to time. We will notify you of
              significant changes through the app or by other means. Your
              continued use of the Service after changes take effect constitutes
              your acceptance of the new Terms.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>12. Contact Us</H3>
            <Paragraph>
              If you have any questions about these Terms, please contact us at:
            </Paragraph>
            <Paragraph>
              <Text
                color="$blue10"
                fontWeight="500"
                hitSlop={20}
                onPress={() =>
                  Linking.openURL("mailto:support@projectwalk2gether.org")
                }
              >
                support@projectwalk2gether.org
              </Text>
            </Paragraph>
          </YStack>

          <Spacer size="$8" />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
