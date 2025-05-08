import { collection, query, where } from "@react-native-firebase/firestore";
import React, { createContext, ReactNode, useContext } from "react";
import { Friendship } from "walk2gether-shared";

import { firestore_instance } from "../config/firebase";
import { useAuth } from "./AuthContext";
import { useQuery } from "../utils/firestore";

interface FriendsContextType {
  friendships: Friendship[];
  loading: boolean;
}

// Create the context with a default undefined value
const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

// Hook to use the FriendsContext
export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};

interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider = ({ children }: FriendsProviderProps) => {
  const { user } = useAuth();
  
  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = query(
    collection(firestore_instance, "friendships"),
    where("uids", "array-contains", user?.uid),
    where("deletedAt", "==", null)
  );
  
  const { docs: friendships, status } = useQuery<Friendship>(friendshipsQuery);
  const loading = status === "loading";

  return (
    <FriendsContext.Provider
      value={{
        friendships,
        loading,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

// Higher-Order Component to wrap components with FriendsProvider
export const WithFriendsProvider = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WithFriendsWrapper = (props: P) => {
    return (
      <FriendsProvider>
        <Component {...props} />
      </FriendsProvider>
    );
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithFriendsWrapper.displayName = `WithFriendsProvider(${displayName})`;

  return WithFriendsWrapper;
};
