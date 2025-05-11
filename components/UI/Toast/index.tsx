import React from "react";
import RNToast from "react-native-toast-message";

interface CustomToastProps {
  topOffset?: number;
}

/**
 * Simple wrapper for react-native-toast-message that adds our app-specific configuration
 */
function ToastComponent({ topOffset = 50 }: CustomToastProps) {
  return <RNToast topOffset={topOffset} text2Style={{ fontSize: 16 }} />;
}

// Re-export the original Toast's methods to keep the API compatible
const Toast = Object.assign(ToastComponent, {
  show: RNToast.show,
  hide: RNToast.hide,
});

export default Toast;
