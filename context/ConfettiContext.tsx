import React, { createContext, useContext, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface ConfettiContextType {
  showConfetti: (delay?: number) => void;
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

export function useConfetti(): ConfettiContextType {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
}

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const confettiRef = useRef(null);

  const showConfetti = (delay = 0) => {
    if (delay > 0) {
      setTimeout(() => {
        setIsVisible(true);
        // Reset after animation completes
        setTimeout(() => setIsVisible(false), 5000);
      }, delay);
    } else {
      setIsVisible(true);
      // Reset after animation completes
      setTimeout(() => setIsVisible(false), 5000);
    }
  };

  return (
    <ConfettiContext.Provider value={{ showConfetti }}>
      {children}
      {isVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon
            count={200}
            origin={{ x: 150, y: 0 }}
            autoStart={true}
            fadeOut={true}
            ref={confettiRef}
          />
        </View>
      )}
    </ConfettiContext.Provider>
  );
}
