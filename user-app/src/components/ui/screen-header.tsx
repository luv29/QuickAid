import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomText from "./custom-text";

type HeaderProps = {
  title: string;
  goBack?: boolean;
  headerRight?: React.ReactNode;
  customBackAction?: () => void;
};

export default function ScreenHeader({
  title,
  goBack = true,
  headerRight,
  customBackAction,
}: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-3 px-4">
      <View className="flex-row items-center gap-3">
        {goBack ? (
          <TouchableOpacity
            onPress={() => {
              if (customBackAction) {
                customBackAction();
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        ) : null}
        <CustomText className="text-2xl font-semibold">{title}</CustomText>
      </View>

      {headerRight ?? null}
    </View>
  );
}