import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import firestore, { increment } from "@react-native-firebase/firestore";
import { useCallback, useMemo } from "react";
import { QuotesCollection } from "walk2gether-shared";
import { useDoc } from "./firestore";

// Constants
const QUOTES_DOC_ID = "walkQuotes";
const QUOTES_COLLECTION = "app_data";

/**
 * Gets a quote for the current user based on their quote index
 */
export const useQuoteOfTheDay = () => {
  const { user } = useAuth();
  const { userData } = useUserData();

  // Use the custom useDoc hook to retrieve quotes document
  const quotesPath = `${QUOTES_COLLECTION}/${QUOTES_DOC_ID}`;
  const { doc: quotesDoc, status } = useDoc<QuotesCollection>(quotesPath);

  // Calculate the current quote directly from the document and user data
  const quote = useMemo(() => {
    if (!user || !userData || !quotesDoc) return null;

    const quotes = quotesDoc.quotes || [];
    if (quotes.length === 0) return null;

    // Get the appropriate quote based on user's index
    const quoteIndex = userData.currentQuoteIndex || 0;
    return quotes[quoteIndex % quotes.length];
  }, [user, userData, quotesDoc]);

  // Advance to the next quote
  const advanceToNextQuote = useCallback(async () => {
    if (!user || !userData) return;

    try {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          currentQuoteIndex: increment(1),
        });
    } catch (error) {
      console.error("Error advancing to next quote:", error);
      return null;
    }
  }, [user, userData]);

  return {
    quote,
    loading: status === "loading",
    advanceToNextQuote,
  };
};
