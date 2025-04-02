import React, { useState } from "react";
import { View, TextInput, Image, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/hooks/useAuthSetup";
import CustomButton from "@/src/components/ui/custom-button";
import CustomText from "@/src/components/ui/custom-text";

const SignIn = () => {
  const { phoneNumber, setPhoneNumber, requestOtp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetOTP = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestOtp();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to request OTP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 bg-white px-6 justify-center">
        <View className="items-center mb-12 gap-2">
          <Image
            source={require("@/assets/images/logo/logo.png")}
            className="w-40 h-20"
            resizeMode="contain"
          />
          <CustomText className="text-2xl font-semibold text-center">
            Login and sell on Mazinda
          </CustomText>
        </View>

        <View className="space-y-6">
          <View className="flex-row border border-gray-200 rounded-lg px-3 py-4 items-center">
            <CustomText className="text-gray-500">+91</CustomText>
            <TextInput
              className="flex-1 ml-2"
              placeholder="Enter mobile number"
              keyboardType="number-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <CustomButton
            onPress={handleGetOTP}
            disabled={phoneNumber.length !== 10 || isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Requesting OTP..." : "Get OTP"}
          </CustomButton>
        </View>

        <View className="mt-8 items-center">
          <CustomText className="text-gray-500 text-center">
            By continuing, you agree to our
          </CustomText>
          <CustomText className="text-primary-600">
            Terms of Service & Privacy Policy
          </CustomText>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;