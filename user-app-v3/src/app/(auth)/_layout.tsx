import { Redirect, Stack } from "expo-router";
import { useAuthStore } from '@/src/state/useAuth'

export default function AuthRoutesLayout() {
  const { isAuthenticated } = useAuthStore();

  console.log('This is signed in function', isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href={"/(app)"} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="sign-in" />
  );
}
