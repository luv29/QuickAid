import {
  View,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import CustomText from "@/src/components/ui/custom-text";
import CustomButton from "@/src/components/ui/custom-button";
import { useState, useEffect } from "react";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { messagesService, userService, authService } from "@/src/service";
import { secureStore } from "@/src/secure-store";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import ScreenHeader from "@/src/components/ui/screen-header";
import { AuthorizerType } from "@quick-aid/core";
import { useAuthStore } from '@/src/state/useAuth'


const CELL_COUNT = 6;
const RESEND_DELAY = 30;

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string>();

  const insets = useSafeAreaInsets();
  const { setUser, setAuthenticated, setToken } = useAuthStore()

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0 && pendingVerification) {
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => {
          const newValue = prev - 1;
          if (newValue === 0) {
            setCanResend(true);
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, pendingVerification]);

  const startResendTimer = () => {
    setResendTimer(RESEND_DELAY);
  };

  const handleAuth = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      await messagesService.getOTP(`+91${phoneNumber}`);
      setPendingVerification(true);
      startResendTimer();
    } catch (error) {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const isVerified = await messagesService.verifyOTP(
        `+91${phoneNumber}`,
        value
      );

      if (!isVerified) {
        setError("Invalid OTP. Please try again.");
        return;
      }

      let user = await userService.findMany({
        where: {
          phoneNumber: phoneNumber
        }
      });

      console.log(user.data?.data[0]);

      let userId;
      if (!user.data?.data[0]) {
        // Create new user if not found
        const newUser = await userService.create({
          phoneNumber: phoneNumber,
        });
        userId = newUser.data?.id;
      } else {
        userId = user.data.data[0].id;
      }

      // Get full user data
      const userData = await userService.findOne(userId);

      if (!userData.data) {
        userService.create({
          phoneNumber: phoneNumber,
        });
      }

      // Create auth token
      const { data } = await authService.createToken(`+91${phoneNumber}`, AuthorizerType.MECHANIC);

      // Save token in secure storage
      await secureStore?.setItem(AUTH_TOKEN_KEY, data.token);

      // Update auth store
      setUser(userData.data);
      setAuthenticated(true);
      await setToken(data.token);

      // Navigate to home screen
      router.push("/(app)/(tabs)/home");
    } catch (error) {
      setError("Verification failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setValue("");
    await handleAuth();
  };

  // Handle going back from OTP screen to phone number input screen
  const handleGoBack = () => {
    setPendingVerification(false);
    setValue("");
  };

  // Dismiss keyboard when touched outside input fields
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
            <View className="flex-1 bg-white pt-12">
              <ScreenHeader
                title=""
                goBack={true}
                customBackAction={handleGoBack}
              />
              <View className="px-12 pt-10 flex-1">
                <View className="space-y-4">
                  <CustomText className="text-2xl font-bold my-2">
                    Enter the OTP sent to
                  </CustomText>
                  <CustomText className="text-2xl font-bold">
                    {phoneNumber.substring(0, 5)}XXXXX
                  </CustomText>
                </View>

                <View className="mt-8">
                  <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={{ marginTop: 20 }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({ index, symbol, isFocused }) => (
                      <View
                        key={index}
                        className={`w-10 h-12 border-b-2 mx-2 justify-center items-center ${isFocused ? "border-[#E48F45]" : "border-gray-300"}`}
                        onLayout={getCellOnLayoutHandler(index)}
                      >
                        <CustomText className="text-2xl">
                          {symbol || (isFocused ? <Cursor /> : null)}
                        </CustomText>
                      </View>
                    )}
                  />
                </View>

                {canResend ? (
                  <Pressable onPress={handleResendOTP}>
                    <CustomText className="text-l underline text-gray-500 mt-8 text-center">
                      Resend OTP
                    </CustomText>
                  </Pressable>
                ) : (
                  <CustomText className="text-s text-gray-500 mt-8 text-center">
                    Did not get OTP? Resend OTP in 0:{resendTimer.toString().padStart(2, "0")}
                  </CustomText>
                )}

                {error && (
                  <View className="mt-4">
                    <CustomText className="text-red-500 text-center">
                      {error}
                    </CustomText>
                  </View>
                )}

                <View className="mt-auto mb-8">
                  <CustomButton
                    onPress={onVerifyPress}
                    disabled={isLoading || value.length !== CELL_COUNT}
                    isLoading={isLoading}
                  >
                    Verify & Continue
                  </CustomButton>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <View className="flex-1 bg-white px-12 justify-center">
            <View className="items-center mb-12 gap-2">
              <Pressable onPress={() => router.back()}>
                <Image
                  source={require("@/assets/images/QwikAidLogo.jpeg")}
                  className="w-60 h-60"
                  resizeMode="contain"
                />
              </Pressable>
              <CustomText className="text-2xl -pt-10 font-semibold text-center">
                Login and explore your city
              </CustomText>
            </View>

            <View className="space-y-6 gap-5">
              <View className="flex-row border border-gray-200 rounded-2xl px-3 py-4 items-center">
                <CustomText className="text-gray-500">+91</CustomText>
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Enter mobile number"
                  keyboardType="number-pad"
                  textContentType="telephoneNumber"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>

              <CustomButton
                onPress={handleAuth}
                isLoading={isLoading}
                disabled={phoneNumber.length !== 10 || isLoading}
              >
                Get OTP
              </CustomButton>
            </View>
            <View className="h-52" />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}