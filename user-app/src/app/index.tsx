import { useEffect, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import "../../global.css";
import CustomSafeAreaView from '@/src/components/ui/custom-safeareaview';
import { useAppInitialization } from '@/src/hooks/useAppInitialisation';
import { useAuthStore } from '@/src/state/useAuth';
import { secureStore } from '@/src/secure-store';
import { AUTH_TOKEN_KEY } from '@/src/constants/secureStoreKeys';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Initialize the app
  useAppInitialization();
  // Get mechanic data from auth store
  const { user, isAuthenticated, refreshUser, resetState } = useAuthStore();

  // Check if token exists in secure storage
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await secureStore?.getItem(AUTH_TOKEN_KEY);
        setHasToken(!!token);
      } catch (error) {
        console.error('Error checking token:', error);
        setHasToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Refresh mechanic data if authenticated
  useEffect(() => {
    const refresh = async () => {
      if (isAuthenticated && user?.id) {
        await refreshUser();
        router.replace('/(root)/(tabs)/home');
      }
    };

    if (!isLoading && hasToken && isAuthenticated) {
      refresh();
    }
  }, [isLoading, hasToken, isAuthenticated, user]);

  // Show loading state
  if (isLoading) {
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

  if (!hasToken) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(root)/(tabs)/home" />;
};

export default Index;