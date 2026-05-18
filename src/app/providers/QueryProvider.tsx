import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { type ReactNode, useEffect } from "react";
import { QUERY_PERSIST_KEY } from "@/config/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: QUERY_PERSIST_KEY,
});

const persistOptions = {
  persister,
  maxAge: 1000 * 60 * 60 * 24,
  dehydrateOptions: {
    shouldDehydrateQuery: (q: { meta?: { persist?: boolean } }) =>
      q.meta?.persist !== false,
  },
};

export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return () => queryClient.clear();
  }, []);
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

export function getQueryClient() {
  return queryClient;
}
