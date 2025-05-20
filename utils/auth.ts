import { auth_instance, firestore_instance } from "@/config/firebase";
import { collection, doc } from "@react-native-firebase/firestore";

// Helper function to get current user ID
export const getCurrentUserId = (): string => {
  const user = auth_instance.currentUser;
  if (!user) throw new Error("No user is signed in");
  return user.uid;
};

export const getCurrentUserDocRef = () =>
  doc(collection(firestore_instance, "users"), getCurrentUserId());
