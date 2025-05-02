import functions from "@react-native-firebase/functions";

export const writeLog = functions().httpsCallable("writeLog");

interface Args {
  message: string;
  metadata?: any;
}

// Log in production by default
const loggingEnabled =
  !!process.env.LOGGING_ENABLED || process.env.NODE_ENV === "production";

export function writeLogIfEnabled({ message, metadata }: Args) {
  if (!loggingEnabled) return console.log({ message, metadata });
  return writeLog({ message, metadata });
}
