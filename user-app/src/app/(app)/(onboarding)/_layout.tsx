import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { useAuthStore } from "@/src/state/useAuth";
import type { RelativePathString } from "expo-router";

export const ONBOARDING_STEPS = {
  BASIC_INFO: {
    step: 1,
    path: "registration",
    heading: "Enter Your Basic Details",
    requiredFields: ['name']
  },
  CONTACT_DETAILS: {
    step: 2,
    path: "contact-details",
    heading: "Contact Details",
    requiredFields: ['phoneNumber', 'email', 'alternatePhoneNumber']
  },
  ADDRESS: {
    step: 3,
    path: "address",
    heading: "Set Your Address",
    requiredFields: ['address.address', 'address.city', 'address.pincode', 'address.lat', 'address.lng']
  },
  VERIFY_DETAILS: {
    step: 4,
    path: "verify-details",
    heading: "Verify Your Details"
  }
};

export const TOTAL_ONBOARDING_STEPS = 6;

const MechanicOnboardingLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { mechanic } = useAuthStore();

  const getNextIncompleteStep = () => {
    if (!mechanic) {
      return ONBOARDING_STEPS.BASIC_INFO;
    }

    // Check Basic Info (Name only)
    if (!mechanic.name) {
      return ONBOARDING_STEPS.BASIC_INFO;
    }

    // Check Contact Details
    if (!mechanic.phoneNumber || !mechanic.email || !mechanic.alternatePhoneNumber) {
      return ONBOARDING_STEPS.CONTACT_DETAILS;
    }


    // Check Address
    if (
      !mechanic.address ||
      !mechanic.address.address ||
      !mechanic.address.city ||
      !mechanic.address.pincode ||
      mechanic.address.lat === null ||
      mechanic.address.lng === null
    ) {
      return ONBOARDING_STEPS.ADDRESS;
    }

    // If all steps are complete, proceed to verification
    return ONBOARDING_STEPS.VERIFY_DETAILS;
  };

  useEffect(() => {
    const nextStep = getNextIncompleteStep();
    const currentPath = `/(app)/(onboarding)/${nextStep.path}` as RelativePathString;

    if (pathname !== currentPath) {
      console.log("Redirecting to:", currentPath);
      router.replace(currentPath);
    }
  }, [mechanic, pathname]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="registration" />
      <Stack.Screen name="contact-details" />
      <Stack.Screen name="address" />
      <Stack.Screen name="verify-details" />
    </Stack>
  );
};

export default MechanicOnboardingLayout;