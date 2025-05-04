import firebase from "@react-native-firebase/app";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import React, {
  ComponentType,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { showMessage } from "react-native-flash-message";
import { auth_instance } from "../config/firebase";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  verifyToken: (firebaseUser?: FirebaseAuthTypes.User) => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
  // Phone auth methods
  sendPhoneVerificationCode: (phoneNumber: string) => Promise<string>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  claims: null | { permissionsSet: boolean };
  signInWithPhoneCredential: (
    verificationId: string,
    code: string
  ) => Promise<FirebaseAuthTypes.UserCredential>;
  // Custom token auth method
  signInWithToken: (token: string) => Promise<FirebaseAuthTypes.UserCredential>;
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
  const [claims, setClaims] = useState<null | Record<string, any>>(null);
  const [hasTokenBeenVerified, setHasTokenBeenVerified] = useState(false);

  // Function to validate the user's token and get custom claims
  const verifyToken = async (firebaseUser?: FirebaseAuthTypes.User) => {
    try {
      // Force token refresh to get the latest claims
      await firebaseUser?.getIdToken(true);

      // Get the ID token result which contains custom claims
      const idTokenResult = await firebaseUser?.getIdTokenResult();
      setHasTokenBeenVerified(true);
      setClaims(idTokenResult?.claims || null);
    } catch (error) {
      signOut();
      console.error("Error refreshing token:", error);
    }
  };
  // Function to refresh the user's token and return it
  const refreshToken = async () => {
    if (!user) return undefined;

    try {
      // Force token refresh and return the new token
      const token = await user.getIdToken(true);

      // Also update the admin status
      await verifyToken(user);

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
      await auth_instance.signOut();
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
    const unsubscribe = auth_instance.onAuthStateChanged(
      async (firebaseUser: FirebaseAuthTypes.User | null) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            // Validate token once when user is loaded
            await verifyToken(firebaseUser);
          } catch (error) {
            console.error("Error validating token:", error);
          }
        } else {
          setUser(null);
          setClaims(null);
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
      const confirmation = await auth_instance.signInWithPhoneNumber(
        phoneNumber
      );
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
      const credential = auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );
      await auth_instance.signInWithCredential(credential);
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

  const signInWithPhoneCredential = async (
    verificationId: string,
    code: string
  ): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );
      const userCredential = await auth_instance.signInWithCredential(
        credential
      );
      return userCredential;
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

  const signInWithToken = async (
    token: string
  ): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      const userCredential = await auth_instance.signInWithCustomToken(token);
      showMessage({
        message: "Success",
        description: "Signed in successfully!",
        type: "success",
        duration: 3000,
      });
      return userCredential;
    } catch (error: any) {
      console.error("Error signing in with token:", error);
      let errorMessage = "Failed to sign in with token";

      if (error.code === "auth/invalid-custom-token") {
        errorMessage = "Invalid authentication token";
      } else if (error.code === "auth/custom-token-mismatch") {
        errorMessage = "Token was issued for a different project";
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
        claims,
        signOut,
        verifyToken,
        refreshToken,
        // Phone auth methods
        sendPhoneVerificationCode,
        verifyPhoneCode,
        signInWithPhoneCredential,
        // Custom token auth method
        signInWithToken,
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
