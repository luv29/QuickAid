import LottieView from "lottie-react-native";
import { StyleProp, View, ViewStyle } from "react-native";

const Loader = ({
  size = 32,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <View style={style}>
      <LottieView
        autoPlay
        style={{ width: size, height: size }}
        loop={true}
        source={require("@/assets/lottie/loader-circle.json")}
      />
    </View>
  );
};

export default Loader;
