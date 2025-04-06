import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

import CustomButton from "@/src/components/CustomButton";
import { images } from "@/src/constants";
import { paymentService } from "../service";
import { useLocationStore } from "@/src/store";
import { PaymentProps } from "@/src/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  serviceRequestId,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const [success, setSuccess] = useState<boolean>(false);

  const openPaymentSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Quick Aid",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          // Create the payment intent and customer on the server
          const { paymentIntent, customer } = await paymentService.createOrder(name, email, amount);

          if (paymentIntent?.client_secret) {
            // Confirm the payment by attaching the payment method and confirming the intent
            const { result } = await paymentService.verifyPayment(paymentMethod.id, paymentIntent.id, customer);

            // If the payment confirmation returns a valid client secret, create the ride record
            if (result?.client_secret) {
              
              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "quickaid://book-ride",
    });

    if (!error) {
      // Optionally, update any loading state here
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Mechanic booked successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for booking your mechanic with QwikAid.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(app)/(tabs)/bookings");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
