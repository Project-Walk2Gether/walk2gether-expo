import Toast from "@/components/UI/Toast";
import { ComponentType, ReactNode, createContext, useContext } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type MessageType = "success" | "error" | "info";

interface FlashMessageContextType {
  showMessage: (
    message: string,
    type?: MessageType,
    options?: { title?: string }
  ) => void;
}

const FlashMessageContext = createContext<FlashMessageContextType | undefined>(
  undefined
);

export const useFlashMessage = () => {
  const context = useContext(FlashMessageContext);
  if (context === undefined) {
    throw new Error(
      "useFlashMessage must be used within a FlashMessageProvider"
    );
  }
  return context;
};

interface FlashMessageProviderProps {
  children: ReactNode;
}

export const FlashMessageProvider: React.FC<FlashMessageProviderProps> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();

  const showMessage = (
    message: string,
    type: MessageType = "info",
    options?: { title?: string }
  ) => {
    Toast.show({
      type,
      text1: options?.title || type === "error" ? "Error" : undefined,
      text2: message,
    });
  };

  const value = { showMessage };

  return (
    <FlashMessageContext.Provider value={value}>
      {children}
      <Toast topOffset={insets.top} />
    </FlashMessageContext.Provider>
  );
};

/**
 * Higher-Order Component for FlashMessageProvider
 */
export const withFlashMessage = <P extends object>(
  Component: ComponentType<P>
) => {
  const WithFlashMessageWrapper = (props: P) => (
    <FlashMessageProvider>
      <Component {...props} />
    </FlashMessageProvider>
  );

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithFlashMessageWrapper.displayName = `withFlashMessage(${displayName})`;

  return WithFlashMessageWrapper;
};
