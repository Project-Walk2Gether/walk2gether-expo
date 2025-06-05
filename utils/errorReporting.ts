import crashlytics from "@react-native-firebase/crashlytics";
import { MessageType } from "@/context/FlashMessageContext";
import { writeLogIfEnabled } from "@/utils/logging";

/**
 * Report a non-fatal error to Crashlytics
 * Use this for errors that don't crash the component but should be tracked
 * This is useful for contexts where the useErrorReporting hook isn't available
 */
export const reportNonFatalErrorToAnalytics = (
  error: Error | unknown,
  context: Record<string, any> = {},
  options: {
    /** Whether to log the error to the console */
    log?: boolean;
  } = { log: true }
) => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  try {
    const crashlyticsInstance = crashlytics();
    
    // Set custom keys for debugging context
    Object.entries(context).forEach(([key, value]) => {
      if (typeof value === "string") {
        crashlyticsInstance.setAttribute(key, value);
      } else {
        crashlyticsInstance.setAttribute(key, JSON.stringify(value));
      }
    });
    
    // Record as non-fatal
    crashlyticsInstance.recordError(errorObj);
    
    // Log to console if requested
    if (options.log) {
      console.error("Non-fatal error:", errorObj, context);
    }
    
    // Log to application logs
    writeLogIfEnabled({
      message: `NON-FATAL ERROR: ${errorObj.message}`,
      metadata: { error: errorObj, ...context },
    });
  } catch (e) {
    console.error("Failed to report error to Crashlytics:", e);
  }
};

/**
 * Error handler factory that creates error handlers with predefined context
 * Useful for creating error handlers in specific domains of the application
 */
export const createErrorHandler = (
  domain: string,
  defaultContext: Record<string, any> = {}
) => {
  return {
    /**
     * Report a non-fatal error with domain-specific context
     */
    reportNonFatalError: (
      error: Error | unknown,
      additionalContext: Record<string, any> = {},
      userMessage?: string
    ) => {
      reportNonFatalErrorToAnalytics(error, {
        domain,
        ...defaultContext,
        ...additionalContext,
        userMessage,
      });
      return error instanceof Error ? error : new Error(String(error));
    },
  };
};

// Create domain-specific error handlers for different parts of the app
export const notificationErrorHandler = createErrorHandler("notifications");
export const locationErrorHandler = createErrorHandler("location");
export const walkErrorHandler = createErrorHandler("walks");
export const authErrorHandler = createErrorHandler("auth");
export const apiErrorHandler = createErrorHandler("api");
