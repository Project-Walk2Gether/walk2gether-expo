import { createContext } from "react";

interface ErrorContextType {
  /**
   * @deprecated Use reportNonFatalError instead
   */
  catchError: (error: Error, extraContext: any) => void;
  
  /**
   * Report a non-fatal error to Crashlytics and show a user-friendly message
   * Use this for errors that don't crash the component but should be tracked
   */
  reportNonFatalError: (error: Error, extraContext?: Record<string, any>, userMessage?: string) => void;
  
  /**
   * Report a fatal error to Crashlytics
   * This is handled automatically by the ErrorBoundary for rendering errors,
   * but can be called manually for errors that should crash the component
   */
  reportFatalError: (error: Error, extraContext?: Record<string, any>) => void;
}

export const ErrorContext = createContext<ErrorContextType>(undefined as any);
