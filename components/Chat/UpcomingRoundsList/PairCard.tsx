import React from 'react';
import { Text, XStack, Spinner } from 'tamagui';
import { Pair } from 'walk2gether-shared';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState, useRef } from 'react';

interface Props {
  pair: Pair;
  width: number;
}

interface UserInfo {
  displayName: string;
  photoURL?: string;
}

export const PairCard = ({ pair, width }: Props) => {
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const isMounted = useRef(true);
  
  // Fetch user information for the pair - but only once the component is visible
  useEffect(() => {
    // Don't fetch again if we already have data or are currently loading
    if (Object.keys(users).length > 0 || isLoading || hasAttemptedFetch) return;
    
    const fetchUsers = async () => {
      setIsLoading(true);
      
      try {
        // Use a batch get to fetch all users at once instead of parallel promises
        const batch = firestore().collection('users');
        
        // Handle the case when there are no userUids
        if (pair.userUids.length === 0) {
          if (isMounted.current) {
            setHasAttemptedFetch(true);
            setIsLoading(false);
          }
          return;
        }
        
        const userDocs = await batch.where(firestore.FieldPath.documentId(), 'in', pair.userUids).get();
        
        const userInfo: Record<string, UserInfo> = {};
        
        userDocs.forEach(doc => {
          if (doc.exists) {
            const data = doc.data();
            userInfo[doc.id] = {
              displayName: data?.displayName || 'Unknown',
              photoURL: data?.photoURL,
            };
          }
        });
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setUsers(userInfo);
          setHasAttemptedFetch(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user information:', error);
        if (isMounted.current) {
          setIsLoading(false);
          setHasAttemptedFetch(true);
        }
      }
    };
    
    // Small delay to prevent immediate fetching when expanding
    const timer = setTimeout(fetchUsers, 100);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [pair.userUids, isLoading, hasAttemptedFetch]);

  return (
    <XStack
      backgroundColor={pair.color}
      padding="$2"
      borderRadius="$4"
      width={width * 0.4}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Text color="white" textAlign="center" fontSize="$5" marginBottom="$1">
        {pair.emoji}
      </Text>
      
      {isLoading ? (
        <Spinner size="small" color="white" />
      ) : Object.entries(users).length > 0 ? (
        Object.entries(users).map(([uid, user]) => (
          <Text key={uid} color="white" textAlign="center" fontSize="$2">
            {user.displayName}
          </Text>
        ))
      ) : (
        <Text color="white" textAlign="center">
          {pair.userUids.length} participants
        </Text>
      )}
    </XStack>
  );
};
