import { COLORS } from "@/styles/colors";
import { router } from "expo-router";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import {
  Button,
  H3,
  ScrollView,
  Text,
  YStack,
  XStack,
} from "tamagui";
import { X } from "@tamagui/lucide-icons";

export default function MarkdownHelpScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Markdown Formatting",
          headerRight: () => (
            <Button
              size="$3"
              circular
              icon={<X size={20} />}
              transparent
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <YStack flex={1} padding="$4">
          {/* Content */}
          <ScrollView flex={1}>
            <YStack space="$4" paddingVertical="$2">
              {/* Explanation */}
              <YStack space="$2" marginBottom="$4">
                <Text fontSize={16} fontWeight="600">What is Markdown?</Text>
                <Text fontSize={14} color="$gray10" lineHeight={20}>
                  Markdown is a simple way to format text using special characters. 
                  It lets you make text bold, italic, create lists, and more without 
                  complex formatting tools. Just type the special characters around 
                  your text and it will be formatted automatically.
                </Text>
              </YStack>

              <YStack space="$1">
              <Text fontWeight="bold">Bold</Text>
              <Text>**bold text** or __bold text__</Text>
              <Text color="$gray10">
                Example: <Text fontWeight="bold">bold text</Text>
              </Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Italic</Text>
              <Text>*italic text* or _italic text_</Text>
              <Text color="$gray10">
                Example: <Text fontStyle="italic">italic text</Text>
              </Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Headings</Text>
              <Text># Heading 1</Text>
              <Text>## Heading 2</Text>
              <Text>### Heading 3</Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Lists</Text>
              <Text>- Item 1</Text>
              <Text>- Item 2</Text>
              <Text> - Nested item</Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Numbered Lists</Text>
              <Text>1. First item</Text>
              <Text>2. Second item</Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Links</Text>
              <Text>[link text](https://example.com)</Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Quotes</Text>
              <Text>{">"} This is a quote</Text>
            </YStack>

            <YStack space="$1">
              <Text fontWeight="bold">Code</Text>
              <Text>`inline code`</Text>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Close Button */}
        <Button
          backgroundColor={COLORS.primary}
          color="white"
          onPress={() => router.back()}
          marginTop="$4"
        >
          Close
        </Button>
      </YStack>
    </SafeAreaView>
    </>
  );
}
