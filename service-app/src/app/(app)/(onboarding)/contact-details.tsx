import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Redirect } from "expo-router";
import ScreenHeader from "@/src/components/ui/screen-header";
import StepIndicator from "@/src/components/ui/stepIndecator";
import CustomButton from "@/src/components/ui/custom-button";
import CustomText from "@/src/components/ui/custom-text";
import CustomInput from "@/src/components/ui/custom-input";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/src/state/useAuth";
import { TOTAL_ONBOARDING_STEPS, ONBOARDING_STEPS } from "./_layout";
import { mechanicService } from "@/src/service";

const ContactDetailsScreen: React.FC = () => {
  const { mechanic, setMechanic } = useAuthStore();
  if (!mechanic) {
    return <Redirect href="/sign-in" />;
  }

  // Form state
  const [primaryPhone, setPrimaryPhone] = useState(
    mechanic?.phoneNumber ?? ""
  );
  const [alternatePhone, setAlternatePhone] = useState(
    mechanic?.alternatePhoneNumber ?? ""
  );
  const [email, setEmail] = useState(mechanic?.email ?? "");

  // Update mutation
  const { mutateAsync: updateMechanic, isPending } = useMutation({
    mutationFn: async () => {
      if (!mechanic) return;

      const updatedMechanic = await mechanicService.update(mechanic.id, {
        phoneNumber: primaryPhone,
        alternatePhoneNumber: alternatePhone,
        email: email || undefined,
      });
      return updatedMechanic;
    },
    onSuccess: (data) => {
      // Update local mechanic state to trigger layout navigation
      if (data) {
        setMechanic(data.data);
        console.log("Contact details updated successfully:", data.data);
      }
    },
    onError: (error) => {
      console.error("Failed to update contact details:", JSON.stringify(error));
    },
  });

  // Handlers
  const handleAlternatePhoneChange = (text: string) => {
    setAlternatePhone(text);
  };

  const handleAlternatePhoneCheckbox = (checked: boolean) => {
    setAlternatePhone(checked ? primaryPhone : "");
  };

  const handleNext = async () => {
    try {
      await updateMechanic();
      // Layout useEffect will handle navigation after mechanic update
    } catch (error) {
      console.error("Failed to proceed to next step:", error);
    }
  };

  const isFormValid = primaryPhone.trim() !== "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white pt-12">
          <ScreenHeader title={ONBOARDING_STEPS.CONTACT_DETAILS.heading} />

          <View className="px-8 flex-1 pb-4">
            <StepIndicator
              currentStep={ONBOARDING_STEPS.CONTACT_DETAILS.step}
              totalSteps={TOTAL_ONBOARDING_STEPS}
            />

            <View className="mt-6">
              <CustomInput
                label="Primary Mobile Number"
                value={primaryPhone}
                onChangeText={setPrimaryPhone}
                placeholder="Enter Primary Mobile Number"
                compulsory={true}
                disabled={mechanic.isPhoneNumberVerified}
              />

              {mechanic.isPhoneNumberVerified ? null : (
                <CustomText className="-mt-5 mb-5 text-m">
                  Incorrect phone number? Change
                </CustomText>
              )}

              <CustomInput
                label="Alternate Mobile Number"
                value={alternatePhone}
                onChangeText={handleAlternatePhoneChange}
                placeholder="Enter Alternate Mobile Number"
                checkboxLabel="Same as Primary Mobile Number"
                checkboxChecked={alternatePhone === primaryPhone}
                onCheckboxChange={handleAlternatePhoneCheckbox}
              />

              <CustomInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ContactDetailsScreen;