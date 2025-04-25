import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Animated } from 'react-native';
import { View, Text, XStack, YStack } from 'tamagui';

type MessageType = 'success' | 'error' | 'info';

interface FlashMessage {
  message: string;
  type: MessageType;
  id: number;
}

interface FlashMessageContextType {
  showMessage: (message: string, type: MessageType) => void;
  messages: FlashMessage[];
}

const FlashMessageContext = createContext<FlashMessageContextType | undefined>(undefined);

export const useFlashMessage = () => {
  const context = useContext(FlashMessageContext);
  if (context === undefined) {
    throw new Error('useFlashMessage must be used within a FlashMessageProvider');
  }
  return context;
};

interface FlashMessageProviderProps {
  children: ReactNode;
}

export const FlashMessageProvider: React.FC<FlashMessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<FlashMessage[]>([]);
  const [nextId, setNextId] = useState(0);

  const showMessage = (message: string, type: MessageType) => {
    const id = nextId;
    setNextId(id + 1);
    
    setMessages(prev => [...prev, { message, type, id }]);
    
    // Auto-remove the message after 3 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, 3000);
  };

  const value = {
    showMessage,
    messages,
  };

  return (
    <FlashMessageContext.Provider value={value}>
      {children}
      {messages.length > 0 && (
        <YStack
          position="absolute"
          top={50}
          left={0}
          right={0}
          alignItems="center"
          zIndex={999}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              padding="$2.5"
              marginVertical="$1.5"
              borderRadius="$2"
              width="90%"
              // Use only tamagui-compatible shadow props
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.25}
              shadowRadius={3.84}
              backgroundColor={msg.type === 'error' ? '#ffcccc' : 
                            msg.type === 'success' ? '#d4edda' : 
                            msg.type === 'info' ? '#d1ecf1' : 'white'}
              borderLeftWidth={5}
              borderLeftColor={msg.type === 'error' ? '#ff0000' : 
                               msg.type === 'success' ? '#28a745' : 
                               msg.type === 'info' ? '#17a2b8' : '#999'}
            >
              <Text 
                color="#333"
                fontSize={16}
              >
                {msg.message}
              </Text>
            </View>
          ))}
        </YStack>
      )}
    </FlashMessageContext.Provider>
  );
};


