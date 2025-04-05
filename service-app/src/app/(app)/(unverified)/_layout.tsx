// ./(app)/_layout.tsx
import { Stack } from "expo-router";
import Spinner from "react-native-loading-spinner-overlay";
import { useAuthStore } from "@/src/state/useAuth";

export default function AppLayout() {
  const { isLoading } = useAuthStore();

  return (
    <>
      <Spinner visible={isLoading} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
      </Stack>
    </>
  );
}