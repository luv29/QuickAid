import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import CustomText from "./custom-text";

type ExpandableSectionProps = {
  title: string;
  children: React.ReactNode;
};

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <View className="mt-6">
      <TouchableOpacity
        onPress={toggleExpand}
        className="flex-row items-center justify-center"
      >
        <CustomText className="">{title}</CustomText>
        <AntDesign name={isExpanded ? "up" : "down"} size={20} color="gray" />
      </TouchableOpacity>

      {isExpanded && <View className="mt-3">{children}</View>}
    </View>
  );
};

export default ExpandableSection;
