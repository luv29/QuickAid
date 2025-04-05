import { useState } from "react";
import { Image, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/src/constants";
import { router } from "expo-router";
import { useAuthStore } from "@/src/state/useAuth";
const Profile = () => {
  const handleSignOut = () => {
      //signOut();
      router.replace("/(auth)/sign-in");
    };

    const {mechanic} = useAuthStore();

  // Dummy user data
  const dummyUser = {
    firstName: mechanic?.name,
    lastName: mechanic?.name,
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    primaryEmailAddress: { emailAddress: mechanic?.email},
    primaryPhoneNumber: { phoneNumber: mechanic?.phoneNumber}
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
            {/* <InputField
              label="First name"
              placeholder={dummyUser.firstName}
              containerStyle="w-full"
              inputStyle="p-3.5 bg-gray-900 "
              editable={false}
            />

            <InputField
              label="Last name"
              placeholder={dummyUser.lastName}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Email"
              placeholder={dummyUser.primaryEmailAddress.emailAddress}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Phone"
              placeholder={dummyUser?.primaryPhoneNumber?.phoneNumber}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            /> */}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
