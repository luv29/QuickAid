import { View } from "react-native";
import CustomText from "./custom-text";

type CustomLabelProps = {
  label: string;
  compulsory?: boolean;
};

const CustomLabel: React.FC<CustomLabelProps> = ({
  label,
  compulsory = false,
}) => {
  return (
    <View>
      <CustomText className="text-lg font-medium mb-2 text-gray-800">
        {label}
        {compulsory && <CustomText className="text-red-500">*</CustomText>}
      </CustomText>
    </View>
  );
};

export default CustomLabel;
