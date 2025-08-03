import { Sheet, SheetRef } from "@/components/Sheet";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { PortalItem } from "tamagui";
import { useMaybePortalHostContext } from "./PortalHostContext";

// SheetRef is now imported from Sheet component

export type SheetOptions = {
  title?: string;
  dismissOnSnapToBottom?: boolean;
  portalHostName?: string;
};

type SheetContextType = {
  showSheet: (content: ReactNode, options?: SheetOptions) => void;
  hideSheet: () => void;
  isSheetOpen: boolean;
};

const SheetContext = createContext<SheetContextType | undefined>(undefined);

// Hook to access the sheet context
export function useSheet() {
  const context = useContext(SheetContext);
  const portalContext = useMaybePortalHostContext();

  if (context === undefined) {
    throw new Error("useSheet must be used within a SheetProvider");
  }

  // Create a wrapped version of showSheet that automatically includes portal context
  const enhancedContext = {
    ...context,
    showSheet: (content: ReactNode, options?: SheetOptions) => {
      // Mix in the portal context if available and not explicitly overridden
      const enhancedOptions = {
        ...options,
        // Only use the context's portal host if not explicitly provided in options
        portalHostName: options?.portalHostName || portalContext?.portalHostName,
      };
      
      return context.showSheet(content, enhancedOptions);
    },
  };

  return enhancedContext;
}

export function SheetProvider({ children }: { children: ReactNode }) {
  const [sheetContent, setSheetContent] = useState<ReactNode | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetOptions, setSheetOptions] = useState<SheetOptions>({});
  const sheetRef = useRef<SheetRef>(null);

  const showSheet = (content: ReactNode, options: SheetOptions = {}) => {
    setSheetContent(content);
    setSheetOptions(options);
    setIsSheetOpen(true);
  };

  const hideSheet = () => {
    // Use the ref to properly close the sheet
    sheetRef.current?.close();
  };

  // Function to render the sheet with or without portal
  const renderSheet = () => {
    // Only render the sheet if we have content
    if (!sheetContent && !isSheetOpen) {
      return null;
    }

    const sheetComponent = (
      <Sheet
        ref={sheetRef}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        dismissOnSnapToBottom={sheetOptions.dismissOnSnapToBottom !== false}
        title={sheetOptions.title}
      >
        <View style={{ flex: 1 }}>{sheetContent}</View>
      </Sheet>
    );

    // If we have a portal host name, use portal rendering
    if (sheetOptions.portalHostName) {
      return (
        <PortalItem hostName={sheetOptions.portalHostName}>
          {sheetComponent}
        </PortalItem>
      );
    }

    // Otherwise render directly
    return sheetComponent;
  };

  return (
    <SheetContext.Provider
      value={{
        showSheet,
        hideSheet,
        isSheetOpen,
      }}
    >
      {children}

      {/* Render the sheet, using portal if specified */}
      {renderSheet()}
    </SheetContext.Provider>
  );
}
