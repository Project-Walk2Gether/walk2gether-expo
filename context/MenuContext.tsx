import React, { createContext, ReactNode, useContext } from "react";
import { Button, YStack } from "tamagui";
import { useSheet } from "./SheetContext";
import { useMaybePortalHostContext } from "./PortalHostContext";

// Define the MenuItem type
export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  theme?: "default" | "red" | "green" | "blue";
  children?: ReactNode;
}

// Define the menu options type
interface MenuOptions {
  portalHostName?: string;
}

// Define the MenuContext type
interface MenuContextType {
  showMenu: (title: string, items: MenuItem[], options?: MenuOptions) => void;
}

// Create the context with a default value
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Custom hook to use the menu context
export const useMenu = () => {
  const context = useContext(MenuContext);
  const portalContext = useMaybePortalHostContext();
  
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  
  // Create a wrapped version of showMenu that automatically includes portal context
  const enhancedContext = {
    ...context,
    showMenu: (title: string, items: MenuItem[], options?: MenuOptions) => {
      // Mix in the portal context if available and not explicitly overridden
      const enhancedOptions = {
        ...options,
        // Only use the context's portal host if not explicitly provided in options
        portalHostName: options?.portalHostName || portalContext?.portalHostName,
      };
      
      return context.showMenu(title, items, enhancedOptions);
    },
  };
  
  return enhancedContext;
};

// Menu provider component
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showSheet, hideSheet, isSheetOpen } = useSheet();

  // Function to show the menu
  const showMenu = (
    title: string,
    items: MenuItem[],
    options?: MenuOptions
  ) => {
    // Use the SheetContext to show the menu content
    showSheet(<MenuContent title={title} items={items} onClose={hideSheet} />, {
      title,
      portalHostName: options?.portalHostName,
    });
  };

  return (
    <MenuContext.Provider value={{ showMenu }}>{children}</MenuContext.Provider>
  );
};

// MenuContent component to be displayed in the sheet
interface MenuContentProps {
  title: string;
  items: MenuItem[];
  onClose: () => void;
}

const MenuContent: React.FC<MenuContentProps> = ({ title, items, onClose }) => {
  // Get button theme styles
  const getButtonStyles = (theme: MenuItem["theme"]) => {
    switch (theme) {
      case "red":
        return { backgroundColor: "$red10", color: "white" };
      case "green":
        return { backgroundColor: "$green10", color: "white" };
      case "blue":
        return { backgroundColor: "$blue10", color: "white" };
      default:
        return {}; // Default button styles
    }
  };

  return (
    <YStack gap="$4" padding="$4" paddingTop="$2">
      {items.map((item, index) => (
        <Button
          key={`menu-item-${index}`}
          size="$4"
          onPress={() => {
            onClose();
            setTimeout(() => item.onPress(), 300); // Small delay to let sheet close
          }}
          icon={item.icon}
          iconAfter={item.children}
          {...getButtonStyles(item.theme)}
        >
          {item.label}
        </Button>
      ))}
    </YStack>
  );
};
