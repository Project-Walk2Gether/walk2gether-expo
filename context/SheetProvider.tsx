import React from "react";
import { SheetProvider } from "./SheetContext";

/**
 * Higher-order component that wraps the provided component with SheetProvider
 */
export function withSheetProvider<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithSheetProvider(props: P) {
    return (
      <SheetProvider>
        <Component {...props} />
      </SheetProvider>
    );
  };
}
