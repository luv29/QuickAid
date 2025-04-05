import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import ScreenHeader from "@/src/components/ui/screen-header";
import StepIndicator from "@/src/components/ui/stepIndecator";
import CustomButton from "@/src/components/ui/custom-button";
import CustomText from "@/src/components/ui/custom-text";
import ExpandableSection from "@/src/components/ui/expandable-section";
import CustomImagePicker from "@/src/components/ui/custom-image-picker";
import CustomInput from "@/src/components/ui/custom-input";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/src/state/useAuth";
import { mechanicService } from "@/src/service";
import { TOTAL_ONBOARDING_STEPS } from "./_layout";


const VerifyDetailsScreen: React.FC = () => {
  const { mechanic, setMechanic } = useAuthStore();
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [gstNo, setGstNo] = useState<string>("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);



  const handleImageSelect = (uri: string) => {
    setSelectedImageUri(uri);
  };


  const { mutateAsync: updateDetails, isPending } = useMutation({
    mutationFn: async () => {
      if (!mechanic) return;

      await mechanicService.update(mechanic.id, {
        BankDetails: {
          accountHolderName: accountHolderName,
          accountNumber: accountNumber,
          bankName: bankName,
          ifscCode: ifscCode,
        },
      });
    },
    onSuccess: () => {
      //toast.success("Details saved successfully!");
      console.log("Mechanic details updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update details", JSON.stringify(error));
    },
  });



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 bg-white pt-12 ">
        <ScreenHeader title="Registration" />

        <View className="px-8 flex-1">
          <StepIndicator currentStep={4} totalSteps={TOTAL_ONBOARDING_STEPS} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <CustomText className="text-2xl font-bold my-5 text-left">
              Verifying...
            </CustomText>

            <CustomText className="text-lg">
              We have received your registration request. Please allow us 2-3
              hours to view and approve.
            </CustomText>

            <View className="mt-6">
              <ExpandableSection title="Complete Profile">
                <View>
                  <CustomText className="text-xl font-semibold text-gray-800 text-left">
                    Upload Photo
                  </CustomText>
                  <CustomText className="text-md  my-3 text-left">
                    Add a picture of your store's logo or your storefront. Your
                    photo will be visible to all customers.
                  </CustomText>

                  <CustomImagePicker
                    imageUri={selectedImageUri}
                    onImageSelect={handleImageSelect}
                    disabled={false} // Set to true if the image picker needs to be disabled
                  />
                </View>

                <View className="w-full h-px bg-gray-200 my-4 mb-8" />

                <CustomText className="text-xl font-semibold text-gray-800 text-left mb-4">
                  Bank Details
                </CustomText>

                {/* Account Holder Name */}
                <CustomInput
                  compulsory={true}
                  label="Account Holder Name"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                  placeholder="Enter account holder's name"
                />

                {/* Account Number */}
                <CustomInput
                  compulsory={true}
                  label="Account Number"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                />

                {/* Bank Name */}
                <CustomInput
                  compulsory={true}
                  label="Bank Name"
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Enter bank name"
                />

                {/* IFSC Code */}
                <CustomInput
                  compulsory={true}
                  label="IFSC Code"
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                />

                <View className="w-full h-px bg-gray-200 my-4 mb-8" />


                <View className="w-full h-px bg-gray-200 my-4 mb-8" />

                {/* GST No. */}
                <CustomInput
                  compulsory={true}
                  label="GST Number"
                  value={gstNo}
                  onChangeText={setGstNo}
                  autoCapitalize="characters"
                />
              </ExpandableSection>
            </View>
          </ScrollView>

          {/* Next Button */}
          <View className="mt-auto mb-8">
            <CustomButton
              onPress={() => updateDetails()}
              disabled={
                !accountHolderName || !accountNumber || !bankName || !ifscCode
              }
              isLoading={isPending}
            >
              Save
            </CustomButton>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyDetailsScreen;
