"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import GlobalLoader from "@/components/ui/global-loader";

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(action: () => Promise<T>, important?: boolean) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined,
);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [activeCount, setActiveCount] = useState(0);

  const startLoading = useCallback(() => {
    setActiveCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveCount((count) => Math.max(0, count - 1));
  }, []);

  const withLoading = useCallback(
    async <T,>(action: () => Promise<T>, important = true): Promise<T> => {
      if (!important) {
        return action();
      }

      startLoading();
      try {
        return await action();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  const isLoading = activeCount > 0;

  const value = useMemo(
    () => ({ isLoading, startLoading, stopLoading, withLoading }),
    [isLoading, startLoading, stopLoading, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <GlobalLoader />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
