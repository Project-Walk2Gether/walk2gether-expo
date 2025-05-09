import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ScrollView as RNScrollView } from "react-native";
import { ScrollView, Spinner, Text, YStack } from "tamagui";
import { Message as MessageType } from "walk2gether-shared";
import MessageComponent from "./Message";
import { MessageOptionsSheet } from "./MessageOptionsSheet";

type Props = {
  messages: MessageType[];
  loading?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  currentUserId: string;
  headerTitle?: React.ReactNode;
};

export type MessageListRef = {
  scrollToBottom: () => void;
};

const MessageList = forwardRef<MessageListRef, Props>(
  ({ messages, loading = false, onDeleteMessage, currentUserId }, ref) => {
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
                flex: 1,
                flexGrow: 1,
                padding: 20,
                paddingBottom: 80,
              }}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: false })
              }
            >
              {messages.length === 0 ? (
                <YStack height={80} justifyContent="center" alignItems="center">
                  <Text color="#999" textAlign="center">
                    No messages yet. Say hello!
                  </Text>
                </YStack>
              ) : (
                messages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    onLongPress={handleLongPress}
                  />
                ))
              )}
            </ScrollView>
          )}
        </YStack>

        {/* Message options sheet */}
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
