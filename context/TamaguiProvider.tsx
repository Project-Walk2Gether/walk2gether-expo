import React, { ComponentType } from "react";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";

/**
 * Higher-Order Component for TamaguiProvider
 */
export const withTamagui = <P extends object>(Component: ComponentType<P>) => {
  const WithTamaguiWrapper = (props: P) => (
    <TamaguiProvider config={tamaguiConfig}>
      <Component {...props} />
    </TamaguiProvider>
  );

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithTamaguiWrapper.displayName = `withTamagui(${displayName})`;

  return WithTamaguiWrapper;
};
