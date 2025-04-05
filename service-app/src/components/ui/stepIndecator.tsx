import React from "react";
import { View } from "react-native";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <View className="flex-row items-center justify-between w-full my-4">
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          className={`flex-1 h-1 rounded-full ${
            index < currentStep ? "bg-[#0286FF]" : "bg-gray-300"
          }`}
        />
      ))}
    </View>
  );
};

export default StepIndicator;