import auth, { connectAuthEmulator } from "@react-native-firebase/auth";
import firestore, {
  connectFirestoreEmulator,
} from "@react-native-firebase/firestore";
import functions, {
  connectFunctionsEmulator,
} from "@react-native-firebase/functions";
import storage, {
  connectStorageEmulator,
} from "@react-native-firebase/storage";
import Constants from "expo-constants";

export const emulatorsEnabled =
  __DEV__ && Constants.expoConfig?.extra?.emulatorsEnabledInDev;

// Initialize Firebase services
export const auth_instance = auth();
export const firestore_instance = firestore();
export const db = firestore_instance;
export const functions_instance = functions();
export const storage_instance = storage();

// Use emulators in dev mode if needed
if (emulatorsEnabled) {
  connectAuthEmulator(auth_instance, "http://localhost:9099");
  connectFunctionsEmulator(functions_instance, "localhost", 5001);
  connectFirestoreEmulator(firestore_instance, "localhost", 8080);
  connectStorageEmulator(storage_instance, "localhost", 9199);
  console.log("Firebase emulators enabled");
} else {
  console.log("Firebase emulators disabled");
}
