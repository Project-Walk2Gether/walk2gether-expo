import { COLORS } from "@/styles/colors";
import { router } from "expo-router";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import Markdown from "react-native-markdown-display";
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
                <Text color="$gray8">**bold text** or __bold text__</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>**bold text**</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Italic</Text>
                <Text color="$gray8">*italic text* or _italic text_</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>*italic text*</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Headings</Text>
                <Text color="$gray8"># Heading 1</Text>
                <Text color="$gray8">## Heading 2</Text>
                <Text color="$gray8">### Heading 3</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>## This is a heading</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Lists</Text>
                <Text color="$gray8">- Item 1</Text>
                <Text color="$gray8">- Item 2</Text>
                <Text color="$gray8">  - Nested item</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>{`- First item\n- Second item\n  - Nested item`}</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Numbered Lists</Text>
                <Text color="$gray8">1. First item</Text>
                <Text color="$gray8">2. Second item</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>{`1. First item\n2. Second item`}</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Links</Text>
                <Text color="$gray8">[link text](https://example.com)</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>[Visit our website](https://walk2gether.com)</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Quotes</Text>
                <Text color="$gray8">{">"}This is a quote</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>{`> This is an inspiring quote`}</Markdown>
              </YStack>

              <YStack space="$1">
                <Text fontWeight="bold">Code</Text>
                <Text color="$gray8">`inline code`</Text>
                <Text color="$gray10" fontSize={13}>Example:</Text>
                <Markdown style={{ body: { fontSize: 14 } }}>Use the `join` command to participate</Markdown>
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
