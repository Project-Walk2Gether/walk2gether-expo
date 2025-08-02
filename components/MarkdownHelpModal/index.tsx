import { COLORS } from "@/styles/colors";
import React from "react";
import {
  Button,
  Dialog,
  H3,
  PortalItem,
  ScrollView,
  Text,
  YStack,
} from "tamagui";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MarkdownHelpModal({ open, onOpenChange }: Props) {
  return (
    <PortalItem name="modal-sheet">
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: 20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          padding="$5"
          mx="$4"
          borderRadius={24}
          maxHeight="80%"
        >
          <YStack space="$2">
            <H3 textAlign="center">Markdown Formatting</H3>

            <ScrollView>
              <YStack space="$4" paddingVertical="$2">
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

            <Button
              backgroundColor={COLORS.primary}
              color="white"
              onPress={() => onOpenChange(false)}
              marginTop="$2"
            >
              Close
            </Button>
          </YStack>
        </Dialog.Content>
      </Dialog>
    </PortalItem>
  );
}
