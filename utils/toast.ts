import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  position?: 'top' | 'bottom';
  duration?: number;
}

/**
 * Shows a toast message using react-native-toast-message
 */
export const showToast = ({
  message,
  type = 'success',
  position = 'bottom',
  duration = 3000,
}: ToastOptions) => {
  Toast.show({
    type,
    text1: message,
    position,
    visibilityTime: duration,
  });
};
