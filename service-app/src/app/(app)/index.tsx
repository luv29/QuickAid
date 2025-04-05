import Loader from "@/src/components/ui/loader";
import { useAuthStore } from "@/src/state/useAuth";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { Mechanic, Prisma } from "@quick-aid/core";
import { authService, mechanicService } from "@/src/service";

const isRegistrationComplete = (mechanic: Mechanic): boolean => {
  return Boolean(
    mechanic &&
    mechanic.name &&
    mechanic.phoneNumber &&
    mechanic.isPhoneNumberVerified === true &&
    mechanic.address &&
    mechanic.location &&
    mechanic.services &&
    mechanic.services.length > 0 &&
    mechanic.BankDetails
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
          router.push("/sign-in");
          return;
        }

        // Validate token
        const decoded = await authService.verifyToken(token);
        if (!decoded || !decoded.data?.phoneNumber) {
          router.push("/sign-in");
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
            // Mechanic has completed registration
            if (mechanic.approved === true) {
              router.push("/(app)/(tabs)");
            } else {
              router.push("/(app)/(verify-store)");
            }
          } else {
            // Mechanic has incomplete registration, send to registration flow
            router.push("/(app)/(onboarding)/registration");
          }
          return;
        }

        // No existing mechanic found, create new onboarding record
        router.push("/(app)/(onboarding)/registration");

      } catch (error) {
        console.error("Error handling mechanic fetch:", error);
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
