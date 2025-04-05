import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import * as Fonts from "expo-font";
import "../../global.css";
import { fonts } from "@/src/utils/fonts";
import { AppProvider } from "@/src/components/providers/app-provider";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Fonts.loadAsync(fonts);
      } catch (e) {
        console.warn("Error loading fonts:", e);
      } finally {
        setIsReady(true);
        // Hide splash screen once everything is ready
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Show a loading indicator if assets aren't loaded yet
  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(app)" options={{ animation: "fade" }} />
          <Stack.Screen name="(root)" options={{ animation: "fade" }} />
        </Stack>
        <Toast />
      </AppProvider>
    </SafeAreaProvider>
  );
}