import { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Redirect, router } from "expo-router";
import ScreenHeader from "@/src/components/ui/screen-header";
import StepIndicator from "@/src/components/ui/stepIndecator";
import CustomButton from "@/src/components/ui/custom-button";
import CustomText from "@/src/components/ui/custom-text";
import CustomInput from "@/src/components/ui/custom-input";
import { useMutation } from "@tanstack/react-query";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuthStore } from "@/src/state/useAuth";
import { useLocationSetup } from "@/src/hooks/location/useLocationSetup";
import { TOTAL_ONBOARDING_STEPS, ONBOARDING_STEPS } from "./_layout";
import CustomLabel from "@/src/components/ui/custom-label";
import { mechanicService } from "@/src/service";

const AddressScreen: React.FC = () => {
  const { mechanic, setMechanic } = useAuthStore();
  const address = mechanic?.address;

  if (!mechanic) {
    return <Redirect href="/sign-in" />;
  }

  const [building, setBuilding] = useState<string>(address?.address ?? "");
  const [city, setCity] = useState<string>(address?.city ?? "");
  const [pincode, setPincode] = useState<string>(address?.pincode ?? "");
  const [coordinates, setCoordinates] = useState({
    lat: address?.lat ?? 0,
    lng: address?.lng ?? 0,
  });

  const { getCurrentCoordinates } = useLocationSetup();

  const { mutateAsync: updateMechanic, isPending } = useMutation({
    mutationFn: async () => {
      const updatedMechanic = await mechanicService.update(mechanic.id, {
        address: {
          address: building,
          city: city,
          pincode: pincode,
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      });
      return updatedMechanic;
    },
    onSuccess: (data) => {
      setMechanic(data.data);
      console.log("Mechanic address updated successfully:", data.data);
    },
    onError: (error) => {
      console.error("Mechanic address update failed:", JSON.stringify(error));
    },
  });

  const fetchCurrentCoordinates = async () => {
    const coordinates = await getCurrentCoordinates();
    if (coordinates) {
      console.log("Current coordinates fetched:", coordinates);
      setCoordinates({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
    }
  };

  useEffect(() => {
    fetchCurrentCoordinates();
  }, []);

  const handleNext = async () => {
    try {
      await updateMechanic();
      // Layout useEffect will handle navigation after mechanic update
    } catch (error) {
      console.error("Failed to proceed to next step:", error);
    }
  };

  const isFormValid =
    building.trim() !== "" &&
    city.trim() !== "" &&
    pincode.trim() !== "" &&
    coordinates.lat !== 0 &&
    coordinates.lng !== 0;

  // This function dismisses the keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View className="flex-1 bg-white pt-12">
          <ScreenHeader title={ONBOARDING_STEPS.ADDRESS.heading} />

          <ScrollView 
            className="px-8 flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <StepIndicator
              currentStep={ONBOARDING_STEPS.ADDRESS.step}
              totalSteps={TOTAL_ONBOARDING_STEPS}
            />

            <View className="mt-6 pb-20">
              <View className="mb-5">
                <CustomLabel label="Set GPS Location" compulsory={true} />

                <TouchableOpacity
                  onPress={fetchCurrentCoordinates}
                  className={`flex-row items-center mt-2 ${
                    coordinates.lat !== 0 && coordinates.lng !== 0
                      ? "bg-green-200"
                      : "bg-gray-200"
                  } rounded-lg p-4 gap-2`}
                >
                  <FontAwesome6
                    name={coordinates.lat !== 0 ? "circle-check" : "location-crosshairs"}
                    size={24}
                    color={coordinates.lat !== 0 ? "green" : "black"}
                  />
                  <CustomText
                    className={`text-lg font-medium ${
                      coordinates.lat !== 0 ? "text-green-800" : ""
                    }`}
                  >
                    {coordinates.lat !== 0
                      ? "GPS Location is set"
                      : "Set GPS Location"}
                  </CustomText>
                </TouchableOpacity>
              </View>

              <CustomInput
                value={building}
                onChangeText={setBuilding}
                placeholder="Building, Street, Area"
                label="Garage Address"
                compulsory={true}
              />
              <CustomInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                label="City"
                compulsory={true}
              />
              <CustomInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="Pincode"
                label="Pincode"
                compulsory={true}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View className="px-8 mt-auto mb-8">
            <CustomButton
              onPress={handleNext}
              disabled={!isFormValid || isPending}
              isLoading={isPending}
            >
              Next
            </CustomButton>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddressScreen;