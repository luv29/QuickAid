import Loader from "@/src/components/ui/loader";
import { useAuthStore } from "@/src/state/useAuth";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { Mechanic } from "@quick-aid/core";
import { authService, mechanicService } from "@/src/service";

const isRegistrationComplete = (mechanic: Mechanic): boolean => {
  return Boolean(
    mechanic &&
    mechanic.name &&
    mechanic.phoneNumber &&
    mechanic.isPhoneNumberVerified === true &&
    mechanic.address 
  );
};

const Index = () => {
  const { setMechanic, setAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndHandleMechanic = async () => {
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
        
        // Try to fetch existing mechanic
        const { data } = await mechanicService.findMany({
          where: {
            phoneNumber
          },
        });
        
        const mechanic: Mechanic = data.data[0];
        
        if (mechanic) {
          setMechanic(mechanic);
          setAuthenticated(true);
          
          // Check if mechanic has all required fields
          if (isRegistrationComplete(mechanic)) {
            // Mechanic has completed registration.
            if (mechanic.approved === true) {
              router.replace("/(app)/(tabs)/home");
            } else {
              router.replace("/(app)/(verify-store)");
            }
          } else {
            router.replace("/(app)/(onboarding)/registration");
          }
          return;
        }
                
        // No existing mechanic found, create new onboarding record
        router.replace("/(app)/(onboarding)/registration");
      } catch (error) {
        console.error("Error handling mechanic fetch:", error);
        router.replace("/(auth)/sign-in");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndHandleMechanic();
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