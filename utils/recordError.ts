import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Reports an error to Firebase Crashlytics with optional context.
 * @param error The error object or message to report.
 * @param context Optional additional context (object with key-value pairs) to attach as attributes.
 */
export function recordError(error: unknown, context?: Record<string, string>) {
  // Always log the error to the console for local debugging
  console.error('Reporting error to Crashlytics:', error, context);

  // Only report to Crashlytics in production
  if (!__DEV__) {
    // Record the error
    if (error instanceof Error) {
      crashlytics().recordError(error);
    } else if (typeof error === 'string') {
      crashlytics().recordError(new Error(error));
    } else {
      crashlytics().recordError(new Error('Unknown error type'));
    }
    // Add context as custom attributes
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().setAttribute(key, value);
      });
    }
  }
}
