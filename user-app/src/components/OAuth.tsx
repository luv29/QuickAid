import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";
import { icons } from "../constants";
import { googleOAuth } from "../libs/auth";
import CustomButton from "./ui/custom-button";


const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(app)");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        className="mt-5 w-full shadow-none"
        onPress={handleGoogleSignIn}
      >
        Log In with Google
      </CustomButton>
    </View>
  );
};

export default OAuth;
