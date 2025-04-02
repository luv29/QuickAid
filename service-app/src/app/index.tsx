import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import tailwind from 'twrnc';

import CustomSafeAreaView from '@/src/components/ui/custom-safeareaview';
import { useAppInitialization } from '@/src/hooks/useAppInitialisation';
import { useAuthStore } from '@/src/state/authStorage';


const Index = () => {
  useAppInitialization();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore();

  const refresh = async () => {
    if (user?.id) {
      await refreshUser(user.id);
      router.replace('/(app)');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      refresh();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaProvider>
      <CustomSafeAreaView 
        style={tailwind`flex-1 bg-white items-center justify-center`}
      >
        <LottieView
          autoPlay
          style={tailwind`w-8 h-8`}
          loop={true}
          source={require('@/assets/lottie/loader-circle.json')}
        />
      </CustomSafeAreaView>
    </SafeAreaProvider>
  );
};

export default Index;