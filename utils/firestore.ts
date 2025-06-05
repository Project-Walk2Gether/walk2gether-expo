import { db } from "@/config/firebase";
import {
  doc as firebaseDoc,
  FirebaseFirestoreTypes,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { WithId } from "walk2gether-shared";

type DocumentData = FirebaseFirestoreTypes.DocumentData;
type DocumentReference<T> = FirebaseFirestoreTypes.DocumentReference<T>;

export function useDoc<T extends DocumentData>(docPath?: string) {
  const [doc, setDoc] = useState<WithId<T> | null>(null);
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [error, setError] = useState<any>(null);
  const docRef = docPath ? firebaseDoc(db, docPath) : null;
  const logLabel = docPath;

  const updateDoc = useCallback(
    (data: Partial<T>) => {
      if (!docRef) return;
      docRef.update(data).catch((e) => {
        console.error("Error updating doc " + logLabel, e);
        setError(e);
      });
    },
    [docRef]
  );

  useEffect(() => {
    if (!docRef) {
      setDoc(null);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        console.log("doc snapshot " + logLabel);
        const data = doc?.data() as T;
        if (!data) setDoc(null);
        else
          setDoc(
            documentWithIdFromSnapshot(
              doc as FirebaseFirestoreTypes.DocumentSnapshot<T>
            )
          );
        setStatus("success");
      },
      (error) => {
        setError(error);
        console.error("Error fetching doc " + logLabel, error);
      }
    );

    return unsubscribe;
  }, [docPath]);

  return { status, doc, updateDoc, error, docPath };
}

/**
 * Mark a friendship as deleted
 * @param friendshipId The ID of the friendship to mark as deleted
 * @param userId The ID of the user who initiated the deletion
 * @returns Promise that resolves when the friendship is marked as deleted
 */
export async function markFriendshipAsDeleted(
  friendshipId: string,
  userId: string
): Promise<void> {
  if (!friendshipId || !userId) {
    throw new Error("Missing required parameters for deleting friendship");
  }

  try {
    const friendshipRef = firebaseDoc(db, `friendships/${friendshipId}`);

    await updateDoc(friendshipRef, {
      deletedAt: serverTimestamp(),
      deletedByUid: userId,
    });
  } catch (error) {
    console.error("Error marking friendship as deleted:", error);
    throw error;
  }
}

export function useQuery<T extends FirebaseFirestoreTypes.DocumentData>(
  query: FirebaseFirestoreTypes.Query | undefined,
  deps: Array<unknown> = []
) {
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [docs, setDocs] = useState<WithId<T>[]>([]);

  useEffect(() => {
    console.log("use query running");
    if (!query) return;

    const logLabel = (query as any)._collectionPath._parts.join("/");

    console.log({
      message: "using firestore query " + logLabel,
      deps,
    });

    const unsubscribe = query.onSnapshot(
      (snap) => {
        if (!snap) {
          console.error("Error fetching collection " + logLabel);
        }
        console.log({
          message: `collection snapshot (${logLabel})`,
          count: snap.size,
          docs: snap.docs.length,
        });
        if (!snap) return;
        const docs = snap.docs as FirebaseFirestoreTypes.DocumentSnapshot<T>[];
        const extantDocs = docs.filter((doc) => doc.exists);
        const data = extantDocs.map(documentWithIdFromSnapshot);
        setDocs(data);
        setStatus("success");
      },
      (error) => console.error("Error fetching collection " + logLabel, error)
    );

    return unsubscribe;
  }, [...deps]);

  return { status, loading: status === "loading", docs };
}

/**
 * Fetches multiple documents by their references
 * @param refs Array of document references to fetch
 * @returns Array of documents with their IDs
 */
export async function fetchDocsByRefs<T extends DocumentData>(
  refs: DocumentReference<T>[]
): Promise<Array<WithId<T>>> {
  if (!refs || refs.length === 0) return [];

  const results = await Promise.all(
    refs.map(async (ref) => {
      try {
        console.log("Getting: " + ref.path);
        const snap = await ref.get();
        return snap.exists() ? documentWithIdFromSnapshot(snap) : null;
      } catch (error: any) {
        console.error("Error fetching doc", error);
        return null;
      }
    })
  );

  return results.filter(Boolean) as Array<WithId<T>>;
}

/**
 * Fetches multiple documents by their IDs from a specified collection
 * Uses batching when fetching more than 10 documents for better performance
 * @param collectionPath The path to the collection containing the documents
 * @param ids Array of document IDs to fetch
 * @returns Array of documents with their IDs
 */
export async function fetchDocsByIds<T extends DocumentData>(
  collectionPath: string,
  ids: string[]
): Promise<Array<WithId<T>>> {
  if (!ids || ids.length === 0) return [];

  // Convert IDs to document references
  const refs = ids.map(
    (id) => db.doc(`${collectionPath}/${id}`) as DocumentReference<T>
  );

  // If we have 10 or fewer documents, fetch them all at once
  if (refs.length <= 10) {
    return fetchDocsByRefs<T>(refs);
  }

  // Otherwise, break into batches of 10
  const batches: DocumentReference<T>[][] = [];
  for (let i = 0; i < refs.length; i += 10) {
    batches.push(refs.slice(i, i + 10));
  }

  // Process each batch
  const results: Array<T & { id: string }> = [];
  for (const batch of batches) {
    const batchResults = await fetchDocsByRefs<T>(batch);
    results.push(...batchResults);
  }

  return results;
}

export function documentWithIdFromSnapshot<T extends DocumentData>(
  snapshot: FirebaseFirestoreTypes.DocumentSnapshot<T>
): WithId<T> {
  const data = snapshot.data()!;

  return {
    id: snapshot.id,
    _ref: snapshot.ref as any,
    ...data,
  } as WithId<T>;
}
