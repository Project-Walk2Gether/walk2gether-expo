import { createContext } from "react";

interface ErrorContextType {
  catchError: (error: Error, extraContext: any) => void;
}

export const ErrorContext = createContext<ErrorContextType>(undefined as any);
