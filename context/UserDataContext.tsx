import { doc, getDoc, setDoc } from "@react-native-firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "../config/firebase";
import { User } from "../types";
import { useAuth } from "./AuthContext";

interface UserDataContextType {
  userData: User | null;
  loading: boolean;
  updateUserData: (data: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({
  children,
}) => {
  const { user: firebaseUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = async (uid: string) => {
    try {
      console.log("Fetching user data, uid: " + uid);
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists) {
        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
        } as User;

        setUserData(userData);
      } else {
        console.log("No user data found in Firestore");
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!firebaseUser) {
      throw new Error("No authenticated user");
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userRef, data, { merge: true });
      // Refresh user data after update
      await fetchUserData(firebaseUser.uid);
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!firebaseUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    await fetchUserData(firebaseUser.uid);
  };

  // Listen for changes in the Firebase user
  useEffect(() => {
    if (firebaseUser) {
      console.log("Fetching");
      fetchUserData(firebaseUser.uid);
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [firebaseUser]);

  return (
    <UserDataContext.Provider
      value={{
        userData,
        loading,
        updateUserData,
        refreshUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
