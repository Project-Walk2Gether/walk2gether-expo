import Constants from "expo-constants";

// We use the firebase emulators if we're in development, and the "emulatorsEnabledInDev" flag is
// set to true
export const emulatorsEnabled =
  __DEV__ && Constants.expoConfig?.extra?.emulatorsEnabledInDev;
