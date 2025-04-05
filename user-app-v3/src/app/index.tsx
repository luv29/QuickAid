import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import CustomSafeAreaView from "@/src/components/ui/custom-safeareaview";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { useAppInitialization } from "@/src/hooks/useAppInitialisation";
import { registerBackgroundTask, unregisterBackgroundTask } from '../../backgroundTasks';
import SOSFeature from '../components/SOSFeature';
import SOSFeatureTest from '../components/SOSFeatureTest';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

  useEffect(() => {
    // Register background task when app starts
    registerBackgroundTask()
      .then(success => {
        console.log('Background task registration:', success ? 'successful' : 'failed');
      })
      .catch((error: Error) => {
        console.log('Failed to register background task', error);
      });
    
    // Clean up on unmount
    return () => {
      unregisterBackgroundTask()
        .then(success => {
          console.log('Background task unregistration:', success ? 'successful' : 'failed');
        })
        .catch((error: Error) => {
          console.log('Failed to unregister background task', error);
        });
    };
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
          <SOSFeature/>
          <SOSFeatureTest/>
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