import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ScrollView as RNScrollView } from "react-native";
import { ScrollView, Spinner, Text, YStack } from "tamagui";
import { Message as MessageType, Round as RoundType } from "walk2gether-shared";
import { MessageOptionsSheet } from "./MessageOptionsSheet";
import { TimelineItem, TimelineItemType } from "./TimelineItem";

type Props = {
  timeline: TimelineItemType[];
  loading?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  currentUserId: string;
  headerTitle?: React.ReactNode;
  onActiveRoundChange?: (round: RoundType | null) => void;
  context?: "friendship" | "walk";
};

export type MessageListRef = {
  scrollToBottom: () => void;
};

const MessageList = forwardRef<MessageListRef, Props>(
  (
    {
      timeline,
      loading = false,
      onDeleteMessage,
      currentUserId,
      context = "friendship",
    },
    ref
  ) => {
    const scrollViewRef = useRef<RNScrollView | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
      null
    );
    const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      },
    }));

    // Handle long press on message
    const handleLongPress = (message: MessageType) => {
      setSelectedMessage(message);
      setOptionsSheetOpen(true);
    };

    // Handle delete message
    const handleDeleteMessage = async (messageId: string) => {
      if (onDeleteMessage) await onDeleteMessage(messageId);
    };

    return (
      <>
        <YStack f={1}>
          {loading ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Spinner size="large" color="#4EB1BA" />
              <Text marginTop="$4" color="#666">
                Loading messages...
              </Text>
            </YStack>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              flex={1}
              flexGrow={1}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 80,
              }}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: false })
              }
            >
              {timeline.length === 0 ? (
                <YStack
                  height={400}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color="#999" textAlign="center">
                    {context === "walk"
                      ? "No messages yet. Say hello!"
                      : "No messages or walks yet. Say hello or invite to a walk!"}
                  </Text>
                </YStack>
              ) : (
                timeline.map((item) => (
                  <TimelineItem
                    key={
                      item.type === "message"
                        ? `msg-${item.data.id}`
                        : item.type === "walk"
                        ? `walk-${item.data.id}`
                        : `round-${item.data.walkId}-${item.data.roundNumber}`
                    }
                    item={item}
                    currentUserId={currentUserId}
                    onLongPress={
                      item.type === "message" ? handleLongPress : undefined
                    }
                  />
                ))
              )}
            </ScrollView>
          )}
        </YStack>

        <MessageOptionsSheet
          open={optionsSheetOpen}
          onOpenChange={setOptionsSheetOpen}
          selectedMessage={selectedMessage}
          onDeleteMessage={handleDeleteMessage}
        />
      </>
    );
  }
);

export default MessageList;
