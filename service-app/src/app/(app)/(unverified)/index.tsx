import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import ScreenHeader from "@/src/components/ui/screen-header";
import CustomButton from "@/src/components/ui/custom-button";

const VerificationFailedScreen: React.FC = () => {
  const router = useRouter();


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 bg-white pt-12 px-8 items-center justify-center">
        <ScreenHeader title={"Oops, Sorry!"} />
        <Text className="text-lg text-center mt-6 text-gray-700">
          We regret to inform you that we cannot proceed with verifying your store at this time.
        </Text>
        <CustomButton className="mt-6" onPress={() => router.back()}>
          Go Back
        </CustomButton>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerificationFailedScreen;
