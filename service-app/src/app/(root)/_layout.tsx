import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen
        name="confirm-ride"
        options={{
          headerShown: false,
        }}
      /> */}
      <Stack.Screen name="route" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack>
  );
};

export default Layout;