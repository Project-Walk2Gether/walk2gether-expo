import { firestore_instance } from "@/config/firebase";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { UserData } from "walk2gether-shared";

// Type for route result
export type RouteResult =
  | string
  | { pathname: string; params?: Record<string, string> };

/**
 * Determines the proper route for a user based on their authentication status and profile data
 * Used in both auth flow and index route
 *
 * @param userId - Firebase user ID
 * @param options - Optional parameters
 * @returns {Promise<RouteResult>} - Route string or object with pathname and params
 */
export const determineUserRoute = async (
  userId: string,
  options?: {
    referredByUid?: string;
    claims?: Record<string, any>;
  }
): Promise<RouteResult> => {
  // Now check if the user has profile data
  const userDataDocRef = doc(firestore_instance, `users/${userId}`);
  const userDataDoc = await getDoc(userDataDocRef);
  const userData = userDataDoc.data();
  const hasData = !!userData;

  if (hasData) {
    // If the user has a profile, go to the walks screen
    return "/walks";
  } else {
    // Start the onboarding flow
    if (options?.referredByUid) {
      // If there's a referredByUid, include referral params
      return {
        pathname: "/onboarding/complete-your-profile",
        params: {
          referredByUid: options.referredByUid,
        },
      };
    } else {
      // Start normal onboarding flow from the beginning
      return "/onboarding/complete-your-profile";
    }
  }
};

/**
 * Helper to get display name from user data, with fallback
 *
 * @param userId - Firebase user ID
 * @returns {Promise<string>} - User's display name or fallback
 */
export const getUserDisplayName = async (userId: string): Promise<string> => {
  try {
    const userDocRef = firestore_instance.collection("users").doc(userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as UserData;
    return userData?.name || "friend";
  } catch (error) {
    console.error("Error fetching user display name:", error);
    return "friend";
  }
};
