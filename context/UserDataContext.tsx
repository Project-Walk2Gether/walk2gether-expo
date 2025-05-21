import { db } from "@/config/firebase";
import { useDoc } from "@/utils/firestore";
import { doc, setDoc } from "@react-native-firebase/firestore";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { UserData, WithId } from "walk2gether-shared";
import { useAuth } from "./AuthContext";

interface UserDataContextType {
  userData: WithId<UserData> | null;
  loading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  setUserData: (data: Partial<UserData>) => Promise<void>;
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
  const { user: firebaseUser, signOut } = useAuth();
  const {
    doc: userData,
    status,
    error,
  } = useDoc<UserData>(firebaseUser ? "users/" + firebaseUser!.uid : undefined);

  console.log("User data:", { userData, status });

  useEffect(() => {
    if (error && error.code === "firestore/permission-denied") {
      console.log(
        "Permission denied error fetching user data, signing out user"
      );
      signOut();
    } else if (error) {
      console.error("Error fetching user data:", error);
    }
  }, [error]);

  const updateUserData = async (data: Partial<UserData>) => {
    if (!firebaseUser) {
      throw new Error("No authenticated user");
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  const setUserData = async (data: Partial<UserData>) => {
    if (!firebaseUser) {
      throw new Error("No authenticated user");
    }
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error("Error setting user data:", error);
      throw error;
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        userData,
        loading: status === "loading",
        updateUserData,
        setUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
