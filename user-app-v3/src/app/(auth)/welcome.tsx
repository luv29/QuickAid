import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/src/components/ui/custom-button";
import { router } from "expo-router";

const Welcome = () => {
  return (
    <SafeAreaView className="flex h-full bg-white">
     
      <View className="items-center p-5">
        <Image
          source={require("@/assets/images/onboard2.jpg")}
          className="w-full h-[300px]"
          resizeMode="contain"
        />
        <Text className="text-black text-3xl font-bold text-center mt-10">
          Welcome to Quick Aid
        </Text>
      </View>

      <View className="flex-1 justify-end w-full px-4 mb-6">
        <CustomButton
          onPress={() => router.replace("/(auth)/sign-in")}
          className="w-full"
        >
          Get Started
        </CustomButton>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;