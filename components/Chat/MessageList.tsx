import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { ScrollView as RNScrollView } from "react-native";
import { ScrollView, Spinner, Text, YStack } from "tamagui";
import { Message as MessageType, Walk, Round as RoundType } from "walk2gether-shared";
import { TimelineItem, TimelineItemType } from "./TimelineItem";
import { MessageOptionsSheet } from "./MessageOptionsSheet";

type Props = {
  timeline: TimelineItemType[];
  loading?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  currentUserId: string;
  headerTitle?: React.ReactNode;
  onActiveRoundChange?: (round: RoundType | null) => void;
};

export type MessageListRef = {
  scrollToBottom: () => void;
};

const MessageList = forwardRef<MessageListRef, Props>(
  ({ timeline, loading = false, onDeleteMessage, currentUserId, onActiveRoundChange }, ref) => {
    const scrollViewRef = useRef<RNScrollView | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
      null
    );
    const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
    const [activeRound, setActiveRound] = useState<RoundType | null>(null);
    
    // Extract rounds from timeline
    const rounds = React.useMemo(() => {
      return timeline
        .filter((item): item is { type: "round"; data: RoundType } => item.type === "round")
        .map(item => item.data);
    }, [timeline]);
    
    // Set the active round to the last round when rounds change
    useEffect(() => {
      if (rounds.length > 0 && !activeRound) {
        const lastRound = rounds[rounds.length - 1];
        setActiveRound(lastRound);
      }
    }, [rounds.length]);
    
    // Notify parent component when active round changes
    useEffect(() => {
      if (onActiveRoundChange) {
        onActiveRoundChange(activeRound);
      }
    }, [activeRound, onActiveRoundChange]);

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
    
    // Handle toggling active round
    const handleToggleActiveRound = (round: RoundType) => {
      if (activeRound?.roundNumber === round.roundNumber) {
        // If tapping the currently active round, deactivate it
        setActiveRound(null);
      } else {
        // Otherwise, set this round as active
        setActiveRound(round);
      }
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
                <YStack height={80} justifyContent="center" alignItems="center">
                  <Text color="#999" textAlign="center">
                    No messages or walks yet. Say hello or invite to a walk!
                  </Text>
                </YStack>
              ) : (
                timeline.map((item, index) => (
                  <TimelineItem
                    key={item.type === 'message' ? `msg-${item.data.id}` : 
                         item.type === 'walk' ? `walk-${item.data.id}` : 
                         `round-${item.data.walkId}-${item.data.roundNumber}`}
                    item={item}
                    currentUserId={currentUserId}
                    onLongPress={item.type === 'message' ? handleLongPress : undefined}
                    activeRound={activeRound}
                    onToggleActiveRound={handleToggleActiveRound}
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
