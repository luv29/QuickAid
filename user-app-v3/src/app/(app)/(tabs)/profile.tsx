import { useState } from "react";
import { Image, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/src/state/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/src/constants";

const Profile = () => {
  const { user, resetState } = useAuthStore();

  const handleSignOut = async () => {
    await resetState(); // Reset the auth state (clears token, user data, etc.)
    router.replace("/(auth)/sign-in");
  };

  // Dummy user data
  const dummyUser = {
    firstName: user?.name,
    lastName: user?.name,
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    primaryEmailAddress: { emailAddress: user?.email },
    primaryPhoneNumber: { phoneNumber: user?.phoneNumber }
  };

  // State for selected plan
  const [selectedPlan, setSelectedPlan] = useState("basic");

  // Plan details
  const pricingPlans = [
    {
      id: "basic",
      title: "Pay-per-use (Basic Plan)",
      description: "Pay for each service request with fees varying by service type and distance. Ideal for occasional users needing on-demand help.",
      features: ["No monthly fees", "Pay only when you use", "All services available"]
    },
    {
      id: "premium",
      title: "Subscription (Premium Plan)",
      description: "Monthly fee grants priority access, discounted service rates, faster response times, and unlimited SOS calls.",
      features: ["Priority access", "Discounted rates", "Faster response times", "Unlimited SOS calls"]
    },
    {
      id: "enterprise",
      title: "Enterprise Plan",
      description: "Custom-priced contracts for businesses provide fleet management and bulk roadside support for companies with multiple vehicles.",
      features: ["Fleet management", "Bulk discounts", "Dedicated support", "Custom solutions"]
    }
  ];

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
    // Here you would typically update this in your backend/store
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex flex-row items-center justify-between my-5">
          <Text className="text-2xl font-JakartaExtraBold">
            My Profile
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            className="justify-center items-center w-10 h-10 rounded-full bg-white"
          >
            <Image source={icons.out} className="w-4 h-4" />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View className="flex items-center justify-center my-5">
          <Image
            source={{ uri: dummyUser.imageUrl }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className="rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        {/* Profile Information */}
        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-8">
          <View className="flex flex-col items-start justify-start w-full">
            <View className="w-full mb-4">
              <Text className="text-gray-700 mb-1">First name</Text>
              <View className="border border-gray-300 rounded-xl bg-gray-100">
                <Text className="p-3.5 text-gray-800">{dummyUser.firstName}</Text>
              </View>
            </View>

            <View className="w-full mb-4">
              <Text className="text-gray-700 mb-1">Last name</Text>
              <View className="border border-gray-300 rounded-xl bg-gray-100">
                <Text className="p-3.5 text-gray-800">{dummyUser.lastName}</Text>
              </View>
            </View>

            <View className="w-full mb-4">
              <Text className="text-gray-700 mb-1">Email</Text>
              <View className="border border-gray-300 rounded-xl bg-gray-100">
                <Text className="p-3.5 text-gray-800">{dummyUser.primaryEmailAddress.emailAddress}</Text>
              </View>
            </View>

            <View className="w-full mb-4">
              <Text className="text-gray-700 mb-1">Phone</Text>
              <View className="border border-gray-300 rounded-xl bg-gray-100">
                <Text className="p-3.5 text-gray-800">{dummyUser.primaryPhoneNumber.phoneNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing Plans Section */}
        <View className="mb-8">
          <Text className="text-2xl font-JakartaBold mb-5">Explore our pricing plans</Text>
          {/* Pricing Cards */}
          {pricingPlans.map((plan) => (
            <View
              key={plan.id}
              className={`mb-4 p-5 rounded-lg ${selectedPlan === plan.id
                ? "bg-blue-50 border-2 border-blue-500"
                : "bg-white border border-gray-200"
                }`}
            >
              <Text className="text-xl font-JakartaBold mb-2">{plan.title}</Text>
              <Text className="text-gray-600 mb-3">{plan.description}</Text>

              {/* Features */}
              <View className="mb-4">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-1">
                    <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    <Text className="text-gray-700">{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Change Plan Button */}
              {selectedPlan !== plan.id ? (
                <TouchableOpacity
                  onPress={() => handlePlanChange(plan.id)}
                  className="bg-blue-500 py-3 px-4 rounded-lg"
                >
                  <Text className="text-white font-JakartaBold text-center">Switch to this plan</Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-gray-200 py-3 px-4 rounded-lg">
                  <Text className="text-gray-700 font-JakartaBold text-center">Current Plan</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;