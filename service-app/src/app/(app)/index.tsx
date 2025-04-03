import Loader from "@/src/components/ui/loader";
import { useAuthStore } from "@/src/state/useAuth";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { Mechanic, Prisma } from "@quick-aid/core";
import { authService, mechanicService } from "@/src/service";

const Index = () => {
  const { setMechanic, setAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndHandleMechanic = async () => {
      try {
        // Fetch token from secure storage
        const token = await secureStore?.getItem(AUTH_TOKEN_KEY);

        if (!token) {
          router.push("/sign-in");
          return;
        }

        setAuthenticated(true);


        // Validate token
        const decoded = await authService.verifyToken(token);
        if (!decoded || !decoded.data?.phoneNumber) {
          router.push("/sign-in");
          return;
        }

        const phoneNumber = decoded.data.phoneNumber.slice(-10);

        // Try to fetch existing store
        const { data } = await mechanicService.findMany({
          where: {
            phoneNumber
          },
        });

        const Mechanic: Mechanic = data.data[0];

        if (Mechanic) {
          setMechanic(Mechanic);
          if (Mechanic.approved !== true) {
            router.push("/(app)/(onboarding)/verify-details");
            return;
          }
          // main path per move karwa dena hai 
          router.push("/(app)/(tabs)");
          return;
        }

        // Try to fetch existing onboarding store
        const existingMechanic = await mechanicService.findMany({
          where: { phoneNumber }
        });

        if (existingMechanic) {
          setMechanic(existingMechanic.data.data[0]);
          router.push("/(app)/(onboarding)/registration");
          return;
        }

      } catch (error) {
        console.error("Error handling store fetch:", error);
        router.push("/sign-in");
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

  return <Redirect href="/sign-in" />;
};

export default Index;
