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

interface Props {}

export default function PrivacyPolicy() {
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
        <H2 color="$color">Privacy Policy</H2>
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
            Last Updated: March 28, 2025
          </Text>

          <YStack gap="$2">
            <H3>Introduction</H3>
            <Paragraph>
              Welcome to ProjectWalk2Gether.org ("we," "our," or "us"). We
              respect your privacy and are committed to protecting your personal
              data. This privacy policy will inform you about how we look after
              your personal data when you visit our website and tell you about
              your privacy rights and how the law protects you.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>The Information We Collect</H3>
            <H3 size="$4">Information You Provide to Us</H3>
            <Paragraph>
              We may collect personal information that you voluntarily provide
              to us when you:
            </Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>• Register for an account</Paragraph>
              <Paragraph>• Sign up for our newsletter</Paragraph>
              <Paragraph>• Contact us through our contact form</Paragraph>
              <Paragraph>• Participate in surveys or contests</Paragraph>
              <Paragraph>• Make donations</Paragraph>
            </YStack>
            <Paragraph>This information may include:</Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>• Name</Paragraph>
              <Paragraph>• Email address</Paragraph>
              <Paragraph>• Phone number</Paragraph>
              <Paragraph>• Mailing address</Paragraph>
              <Paragraph>• Payment information (if making donations)</Paragraph>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <H3 size="$4">Information We Collect Automatically</H3>
            <Paragraph>
              When you visit our website, we may automatically collect certain
              information about your device, including:
            </Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>• IP address</Paragraph>
              <Paragraph>• Browser type</Paragraph>
              <Paragraph>• Operating system</Paragraph>
              <Paragraph>• Referring website</Paragraph>
              <Paragraph>• Pages you view</Paragraph>
              <Paragraph>• Time spent on pages</Paragraph>
              <Paragraph>• Links clicked</Paragraph>
              <Paragraph>• Cookies and similar technologies</Paragraph>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <H3>How We Use Your Information</H3>
            <Paragraph>
              We use the information we collect for various purposes, including
              to:
            </Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>
                • Provide, operate, and maintain our website
              </Paragraph>
              <Paragraph>
                • Improve, personalize, and expand our website
              </Paragraph>
              <Paragraph>
                • Understand and analyze how you use our website
              </Paragraph>
              <Paragraph>
                • Develop new products, services, features, and functionality
              </Paragraph>
              <Paragraph>
                • Communicate with you, including for customer service, updates,
                and marketing purposes
              </Paragraph>
              <Paragraph>• Process your donations</Paragraph>
              <Paragraph>• Find and prevent fraud</Paragraph>
              <Paragraph>• For compliance with legal obligations</Paragraph>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <H3>How We Share Your Information</H3>
            <Paragraph>We may share your personal information with:</Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>
                • Service providers who perform services on our behalf
              </Paragraph>
              <Paragraph>
                • Payment processors for processing donations
              </Paragraph>
              <Paragraph>
                • Partners for joint activities or initiatives
              </Paragraph>
              <Paragraph>• Legal authorities when required by law</Paragraph>
              <Paragraph>
                • Entities involved in a merger, acquisition, or sale of assets
              </Paragraph>
            </YStack>
            <Paragraph>
              We do not sell your personal information to third parties.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Cookies and Similar Technologies</H3>
            <Paragraph>
              We use cookies and similar technologies to collect information
              about your browsing activities and to distinguish you from other
              users of our website. This helps us provide you with a good
              experience when you browse our website and allows us to improve
              our site.
            </Paragraph>
            <Paragraph>
              You can set your browser to refuse all or some browser cookies, or
              to alert you when websites set or access cookies. If you disable
              or refuse cookies, please note that some parts of this website may
              become inaccessible or not function properly.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Your Rights</H3>
            <Paragraph>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>
                • The right to access your personal information
              </Paragraph>
              <Paragraph>
                • The right to rectification of inaccurate information
              </Paragraph>
              <Paragraph>
                • The right to erasure of your personal information
              </Paragraph>
              <Paragraph>
                • The right to restrict processing of your personal information
              </Paragraph>
              <Paragraph>• The right to data portability</Paragraph>
              <Paragraph>
                • The right to object to processing of your personal information
              </Paragraph>
              <Paragraph>
                • Rights related to automated decision-making and profiling
              </Paragraph>
            </YStack>
            <Paragraph>
              To exercise any of these rights, please contact us using the
              details provided below.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Data Security</H3>
            <Paragraph>
              We have implemented appropriate security measures to prevent your
              personal information from being accidentally lost, used, or
              accessed in an unauthorized way, altered, or disclosed. In
              addition, we limit access to your personal information to those
              employees, agents, contractors, and other third parties who have a
              business need to know.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Data Retention</H3>
            <Paragraph>
              We will only retain your personal information for as long as
              necessary to fulfill the purposes we collected it for, including
              for the purposes of satisfying any legal, accounting, or reporting
              requirements.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Children's Privacy</H3>
            <Paragraph>
              Our website is not intended for children under the age of 13, and
              we do not knowingly collect personal information from children
              under 13. If you are a parent or guardian and believe that your
              child has provided us with personal information, please contact
              us.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Third-Party Links</H3>
            <Paragraph>
              Our website may include links to third-party websites, plug-ins,
              and applications. Clicking on those links or enabling those
              connections may allow third parties to collect or share data about
              you. We do not control these third-party websites and are not
              responsible for their privacy statements. We encourage you to read
              the privacy policy of every website you visit.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Changes to This Privacy Policy</H3>
            <Paragraph>
              We may update this privacy policy from time to time. The updated
              version will be indicated by an updated "Last Updated" date at the
              top of this privacy policy. We encourage you to review this
              privacy policy frequently to be informed of how we are protecting
              your information.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Contact Us</H3>
            <Paragraph>
              If you have any questions about this privacy policy or our privacy
              practices, please contact us at:
            </Paragraph>
            <Paragraph>
              Email:{" "}
              <Text
                color="$blue10"
                fontWeight="500"
                onPress={() =>
                  Linking.openURL("mailto:privacy@projectwalk2gether.org")
                }
              >
                privacy@projectwalk2gether.org
              </Text>
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Legal Basis for Processing Personal Data</H3>
            <Paragraph>
              If you are from the European Economic Area (EEA), our legal basis
              for collecting and using the personal information described in
              this privacy policy depends on the personal information we collect
              and the specific context in which we collect it.
            </Paragraph>
            <Paragraph>
              We may process your personal information because:
            </Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>• We need to perform a contract with you</Paragraph>
              <Paragraph>• You have given us permission to do so</Paragraph>
              <Paragraph>
                • The processing is in our legitimate interests and it's not
                overridden by your rights
              </Paragraph>
              <Paragraph>• To comply with the law</Paragraph>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <H3>International Data Transfers</H3>
            <Paragraph>
              Your information may be transferred to — and maintained on —
              computers located outside of your state, province, country, or
              other governmental jurisdiction where the data protection laws may
              differ from those from your jurisdiction.
            </Paragraph>
            <Paragraph>
              If you are located outside the United States and choose to provide
              information to us, please note that we transfer the information,
              including personal information, to the United States and process
              it there.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>California Privacy Rights</H3>
            <Paragraph>
              If you are a California resident, you have the right to:
            </Paragraph>
            <YStack paddingLeft="$4">
              <Paragraph>
                • Know what personal information we collect about you
              </Paragraph>
              <Paragraph>
                • Request deletion of your personal information
              </Paragraph>
              <Paragraph>
                • Opt-out of the sale of your personal information
              </Paragraph>
              <Paragraph>
                • Not be discriminated against for exercising your rights
              </Paragraph>
            </YStack>
            <Paragraph>
              To exercise these rights, please contact us using the details
              provided in the "Contact Us" section.
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <H3>Do Not Track Signals</H3>
            <Paragraph>
              Some browsers have a "Do Not Track" feature that lets you tell
              websites that you do not want to have your online activities
              tracked. At this time, we do not respond to browser "Do Not Track"
              signals.
            </Paragraph>
          </YStack>

          <Spacer size="$8" />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
