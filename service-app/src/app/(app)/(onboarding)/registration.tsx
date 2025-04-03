import { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Redirect, router } from "expo-router";
import ScreenHeader from "@/src/components/ui/screen-header";
import StepIndicator from "@/src/components/ui/stepIndecator";
import CustomButton from "@/src/components/ui/custom-button";
import CustomInput from "@/src/components/ui/custom-input";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/src/state/useAuth";
import { TOTAL_ONBOARDING_STEPS, ONBOARDING_STEPS } from "./_layout";
import { mechanicService } from "@/src/service";

const RegistrationScreen: React.FC = () => {
  const { mechanic, setMechanic } = useAuthStore();

  if (!mechanic) {
    return <Redirect href="/sign-in" />;
  }

  const [name, setName] = useState<string>(
    mechanic?.name ?? ""
  );
  const [minCommission, setMinCommission] = useState<string>(
    mechanic?.minCommissionPercentage?.toString() ?? ""
  );


  const { mutateAsync: updateMechanic, isPending } = useMutation({
    mutationFn: async () => {
      const updatedMechanic = await mechanicService.update(
        mechanic.id,
        {
          name: name,
          minCommissionPercentage: minCommission ? parseFloat(minCommission) : undefined,
        }
      );
      return updatedMechanic;
    },
    onSuccess: (data) => {
      // Update the local mechanic state to trigger layout navigation
      setMechanic(data.data);
      console.log("Registration data updated successfully:", data.data);
    },
    onError: (error) => {
      console.error("Registration update failed:", JSON.stringify(error));
    },
  });

  const handleNext = async () => {
    try {
      await updateMechanic();
      // The layout's useEffect will handle the navigation after mechanic update
    } catch (error) {
      console.error("Failed to proceed to next step:", error);
    }
  };

  const isFormValid = name.trim() !== "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 bg-white pt-12">
        <ScreenHeader title={ONBOARDING_STEPS.BASIC_INFO.heading} />

        <View className="px-8 flex-1">
          <StepIndicator
            currentStep={ONBOARDING_STEPS.BASIC_INFO.step}
            totalSteps={TOTAL_ONBOARDING_STEPS}
          />

          <View className="mt-6">
            <CustomInput
              label="Your Name"
              compulsory={true}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
            <CustomInput
              label="Minimum Commission (%)"
              value={minCommission}
              onChangeText={setMinCommission}
              placeholder="Enter minimum commission percentage"
              keyboardType="numeric"
            />
          </View>

          <View className="mt-auto mb-8">
            <CustomButton
              onPress={handleNext}
              disabled={!isFormValid || isPending}
              isLoading={isPending}
            >
              Next
            </CustomButton>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegistrationScreen;