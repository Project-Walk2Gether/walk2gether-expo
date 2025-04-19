import { doc, setDoc } from "@react-native-firebase/firestore";
import React, { createContext, ReactNode, useContext } from "react";
import { useDoc } from "utils/firestore";
import { UserData } from "walk2gether-shared";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

interface UserDataContextType {
  userData: UserData | null;
  loading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
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
  const { doc: userData, status } = useDoc(
    firebaseUser ? "users/" + firebaseUser!.uid : undefined
  );

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

  return (
    <UserDataContext.Provider
      value={{
        userData,
        loading: status === "loading",
        updateUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
