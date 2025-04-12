import firebase from "@react-native-firebase/app";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { doc, setDoc } from "@react-native-firebase/firestore";
import { nanoid } from "nanoid";
import React, {
  ComponentType,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { showMessage } from "react-native-flash-message";
import { Location } from "walk2gether-shared";
import { auth, db } from "../config/firebase";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  validateToken: (firebaseUser?: FirebaseAuthTypes.User) => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
  // Phone auth methods
  sendPhoneVerificationCode: (phoneNumber: string) => Promise<string>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  signInWithPhone: (
    verificationId: string,
    code: string,
    userData?: { name: string; location: any }
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Function to validate the user's token and get custom claims
  const validateToken = async (firebaseUser?: FirebaseAuthTypes.User) => {
    try {
      // Force token refresh to get the latest claims
      await firebaseUser?.getIdToken(true);

      // Get the ID token result which contains custom claims
      const idTokenResult = await firebaseUser?.getIdTokenResult();

      // Check for admin claim
      const hasAdminClaim = idTokenResult?.claims.admin === true;
      setIsAdmin(hasAdminClaim);

      console.log("User claims validated, admin status:", hasAdminClaim);
    } catch (error) {
      signOut();
      console.error("Error refreshing token:", error);
      setIsAdmin(false);
    }
  };

  // Function to refresh the user's token and return it
  const refreshToken = async () => {
    if (!user) return undefined;

    try {
      // Force token refresh and return the new token
      const token = await user.getIdToken(true);

      // Also update the admin status
      await validateToken(user);

      return token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      showMessage({
        message: "Error refreshing authentication",
        description: "Please sign out and sign in again",
        type: "danger",
        duration: 4000,
      });
      return undefined;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await auth.signOut();
      setIsAdmin(false);
      showMessage({
        message: "Success",
        description: "Signed out successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error signing out:", error);
      showMessage({
        message: "Error",
        description: "Failed to sign out",
        type: "danger",
        duration: 4000,
      });
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (firebaseUser: FirebaseAuthTypes.User | null) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            // Validate token once when user is loaded
            await validateToken(firebaseUser);
          } catch (error) {
            console.error("Error validating token:", error);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Phone authentication methods
  const sendPhoneVerificationCode = async (
    phoneNumber: string
  ): Promise<string> => {
    try {
      const confirmation = await auth.signInWithPhoneNumber(phoneNumber);
      showMessage({
        message: "Success",
        description: "Verification code sent to your phone",
        type: "success",
        duration: 3000,
      });
      return confirmation.verificationId || "";
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      let errorMessage = "Failed to send verification code";

      if (error.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format";
      } else if (error.code === "auth/quota-exceeded") {
        errorMessage = "Too many requests. Try again later";
      }

      showMessage({
        message: "Error",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });
      throw error;
    }
  };

  const verifyPhoneCode = async (
    verificationId: string,
    code: string
  ): Promise<void> => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );
      await auth.signInWithCredential(credential);
    } catch (error: any) {
      console.error("Error verifying code:", error);
      let errorMessage = "Failed to verify code";

      if (error.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid verification code";
      } else if (error.code === "auth/code-expired") {
        errorMessage = "Verification code has expired";
      }

      showMessage({
        message: "Error",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });
      throw error;
    }
  };

  const signInWithPhone = async (
    verificationId: string,
    code: string,
    userData?: { name: string; location: Location }
  ): Promise<void> => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );
      const userCredential = await auth.signInWithCredential(credential);

      // If userData is provided, we should create or update the user profile
      if (userData) {
        try {
          // Check if user document already exists
          const userRef = doc(db, "users", userCredential.user.uid);
          const userDoc = await db
            .collection("users")
            .doc(userCredential.user.uid)
            .get();

          if (!userDoc.exists) {
            console.log("Creating new user profile in Firestore");
            // Generate a unique invite code - using nanoid for short, URL-friendly IDs
            const friendInvitationCode = nanoid(8);

            // Create new user profile
            await setDoc(userRef, {
              phoneNumber: userCredential.user.phoneNumber || "",
              name: userData.name,
              location: userData.location,
              createdAt: new Date(),
              isAdmin: false,
              friendInvitationCode,
            });
          } else {
            console.log("User profile already exists, updating if needed");
            // User exists but we might want to update some fields
            // Only update if name or location is missing
            const existingData = userDoc.data();
            if (!existingData?.name || !existingData?.location) {
              await setDoc(
                userRef,
                {
                  ...existingData,
                  name: existingData?.name || userData.name,
                  location: existingData?.location || userData.location,
                  // Don't update createdAt or other fields that should persist
                },
                { merge: true }
              );
            }
          }
        } catch (error) {
          console.error("Error creating/updating user profile:", error);
          // Continue with sign-in even if profile creation fails
        }
      }

      showMessage({
        message: "Success",
        description: "Signed in successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error signing in with phone:", error);
      let errorMessage = "Failed to sign in";

      if (error.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid verification code";
      }

      showMessage({
        message: "Error",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signOut,
        validateToken,
        refreshToken,
        // Phone auth methods
        sendPhoneVerificationCode,
        verifyPhoneCode,
        signInWithPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Higher-Order Component to wrap components with AuthProvider
export const WithAuthProvider = <P extends object>(
  Component: ComponentType<P>
) => {
  const WithAuthWrapper = (props: P) => {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    );
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithAuthWrapper.displayName = `WithAuthProvider(${displayName})`;

  return WithAuthWrapper;
};
