import React, { ComponentType } from "react";
import { FlashMessageProvider } from "@/context/FlashMessageContext";

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
