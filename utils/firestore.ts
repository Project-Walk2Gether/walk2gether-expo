import {
  doc as firebaseDoc,
  FirebaseFirestoreTypes,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { WithId } from "walk2gether-shared";
import { DocumentReferenceLike } from "walk2gether-shared/lib/firestore/documentReference";
import { db } from "../config/firebase";

export function useDoc<T extends FirebaseFirestoreTypes.DocumentData>(
  docPath?: string
) {
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
    console.log("re-running effect", { docPath });
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
          setDoc({
            ...data,
            id: doc.id,
            _ref: docRef as DocumentReferenceLike<T>,
          });
        setStatus("success");
      },
      (error) => console.error("Error fetching doc " + logLabel, error)
    );

    return unsubscribe;
  }, [docPath]);

  return { status, doc, updateDoc, error, docPath };
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
        const data = extantDocs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
          _ref: doc.ref as DocumentReferenceLike<T>,
        }));
        setDocs(data);
        setStatus("success");
      },
      (error) => console.error("Error fetching collection " + logLabel, error)
    );

    return unsubscribe;
  }, [...deps]);

  return { status, docs };
}
