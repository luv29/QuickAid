import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NetworkStatusProvider } from "@/src/hooks/useNetworkinfostatus";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkStatusProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NetworkStatusProvider>
      <StatusBar />
    </GestureHandlerRootView>
  );
};
