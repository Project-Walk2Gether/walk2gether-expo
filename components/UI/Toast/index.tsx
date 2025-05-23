import React from "react";
import RNToast, { BaseToast, ErrorToast } from "react-native-toast-message";

interface CustomToastProps {
  topOffset?: number;
}

/**
 * Simple wrapper for react-native-toast-message that adds our app-specific configuration
 */
function ToastComponent({ topOffset = 50 }: CustomToastProps) {
  // Create custom toast configurations to ensure text wrapping
  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ 
          width: '94%', 
          borderLeftColor: '#4CAF50',
          height: 'auto',
          minHeight: 60
        }}
        contentContainerStyle={{ 
          paddingHorizontal: 15,
          paddingVertical: 10
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold'
        }}
        text2Style={{
          fontSize: 15,
          flexWrap: 'wrap',
          flexShrink: 1,
        }}
        text2NumberOfLines={5} // Allow up to 3 lines for longer messages
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ 
          width: '94%', 
          borderLeftColor: '#FF3B30',
          height: 'auto',
          minHeight: 60
        }}
        contentContainerStyle={{ 
          paddingHorizontal: 15,
          paddingVertical: 10
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold'
        }}
        text2Style={{
          fontSize: 15,
          flexWrap: 'wrap',
          flexShrink: 1,
        }}
        text2NumberOfLines={5} // Allow up to 3 lines for longer messages
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{ 
          width: '94%', 
          borderLeftColor: '#007AFF',
          height: 'auto',
          minHeight: 60
        }}
        contentContainerStyle={{ 
          paddingHorizontal: 15,
          paddingVertical: 10
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold'
        }}
        text2Style={{
          fontSize: 15,
          flexWrap: 'wrap',
          flexShrink: 1,
        }}
        text2NumberOfLines={5} // Allow up to 3 lines for longer messages
      />
    ),
  };

  return <RNToast topOffset={topOffset} config={toastConfig} />;
}

// Re-export the original Toast's methods to keep the API compatible
const Toast = Object.assign(ToastComponent, {
  show: RNToast.show,
  hide: RNToast.hide,
});

export default Toast;
