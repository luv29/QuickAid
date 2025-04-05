import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import CustomSafeAreaView from "@/src/components/ui/custom-safeareaview";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { useAppInitialization } from "@/src/hooks/useAppInitialisation";


const RootLoading = () => {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    hasToken: boolean | null;
  }>({
    isLoading: true,
    hasToken: null,
  });

  // Initialize the app
  useAppInitialization();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await secureStore?.getItem(AUTH_TOKEN_KEY);
        setAuthState({
          isLoading: false,
          hasToken: !!token,
        });
      } catch (error) {
        console.error('Error checking token:', error);
        setAuthState({
          isLoading: false,
          hasToken: false,
        });
      }
    };

    checkToken();
  }, []);

  if (authState.isLoading) {
    return (
      <SafeAreaProvider>
        <CustomSafeAreaView className="flex-1 bg-white items-center justify-center">
          <LottieView
            autoPlay
            style={{ width: 32, height: 32 }}
            loop={true}
            source={require("@/assets/lottie/loader-circle.json")}
          />
        </CustomSafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!authState.hasToken) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(app)" />;
};

export default RootLoading;