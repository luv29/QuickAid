import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Alert, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import CustomButton from "@/src/components/ui/custom-button";
import CustomText from "@/src/components/ui/custom-text";
import { useAuth } from "@/src/hooks/useAuthSetup";


const VerifyOTP = () => {
  const { phoneNumber, otp, setOtp, verifyOtp, requestOtp, reset } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Reference for inputs
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Focus next input when a digit is entered
  const handleOtpChange = (text: string, index: number) => {
    // Update OTP state
    const newOtp = otp.split('');
    newOtp[index] = text;
    setOtp(newOtp.join(''));
    
    // Move to next input if text is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle backspace to go to previous input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      await requestOtp();
      setTimer(30);
      setCanResend(false);
      Alert.alert("Success", "OTP sent successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP");
    }
  };
  
  // Handle verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await verifyOtp();
      if (!success) {
        Alert.alert("Invalid OTP", "The OTP you entered is incorrect");
      }
      // Navigation is handled in verifyOtp if successful
    } catch (error) {
      Alert.alert("Error", "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 bg-white px-6 justify-center">
        <View className="mb-8">
          <CustomText className="text-2xl font-semibold mb-2">
            Verify OTP
          </CustomText>
          <CustomText className="text-gray-500">
            We've sent a verification code to +91 {phoneNumber}
          </CustomText>
        </View>
        
        <View className="mb-8">
          <View className="flex-row justify-between mb-6">
            {Array(6).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={el => inputRefs.current[index] = el}
                className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl"
                keyboardType="number-pad"
                maxLength={1}
                value={otp[index] || ''}
                onChangeText={text => handleOtpChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            disabled={!canResend} 
            onPress={handleResendOtp}
            className="self-center"
          >
            <CustomText className={canResend ? "text-primary-600" : "text-gray-400"}>
              {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
            </CustomText>
          </TouchableOpacity>
        </View>
        
        <CustomButton
          onPress={handleVerifyOtp}
          disabled={otp.length !== 6 || isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify & Continue"}
        </CustomButton>
        
        <TouchableOpacity 
          className="mt-4 self-center" 
          onPress={() => {
            reset();
            router.back();
          }}
        >
          <CustomText className="text-gray-500">
            Change Phone Number
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VerifyOTP;