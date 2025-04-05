import Loader from "@/src/components/ui/loader";
import { useAuthStore } from "@/src/state/useAuth";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { User } from "@quick-aid/core";
import { authService, userService } from "@/src/service";



const Index = () => {
  const { setUser, setAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndHandleUser = async () => {
      try {
        // Fetch token from secure storage
        const token = await secureStore?.getItem(AUTH_TOKEN_KEY);
        
        if (!token) {
          router.replace("/(auth)/sign-in");
          return;
        }
        
        // Validate token
        const decoded = await authService.verifyToken(token);
        if (!decoded || !decoded.data?.phoneNumber) {
          router.replace("/(auth)/sign-in");
          return;
        }
        
        const phoneNumber = decoded.data.phoneNumber.slice(-10);
        
        // Try to fetch existing user
        const { data } = await userService.findMany({
          where: {
            phoneNumber
          },
        });
        
        const user: User = data.data[0];
        
        if (user) {
          setUser(user);
          setAuthenticated(true);
          
          // Check if user has completed registration
          if (user) {
            // User has completed registration
            router.replace("/(app)/(tabs)/home");
          } else {
            router.replace("/(auth)/sign-in");
          }
          return;
        }
        
        // No existing user found, redirect to registration
        router.replace("/(auth)/welcome");
      } catch (error) {
        console.error("Error handling user fetch:", error);
        router.replace("/(auth)/sign-in");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndHandleUser();
  }, []);

  // Render a loader or redirect to sign-in if loading is complete but no token is present
  if (isLoading) {
    return (
      <Loader
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    );
  }

  return <Redirect href="/(auth)/sign-in" />;
};

export default Index;