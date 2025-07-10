import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Higher-order component that wraps the provided component with GestureHandlerRootView
 * This is necessary for gesture-based components like bottom sheets to work properly
 */
export function withGestureHandler<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithGestureHandler(props: P) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Component {...props} />
      </GestureHandlerRootView>
    );
  };
}
