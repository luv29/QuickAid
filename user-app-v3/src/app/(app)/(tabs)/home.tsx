import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Map from "@/src/components/Map";
import { images } from "@/src/constants";
import { useLocationStore } from "@/src/store";
import { useNetworkStatus } from "@/src/hooks/useNetworkinfostatus";

const Home = () => {
  const { setUserLocation, setSelectedService } = useLocationStore();
  const { isConnected, setNetworkStatus } = useNetworkStatus();
  const [isOnline, setIsOnline] = useState(isConnected);

  // Update local state when network status changes
  useEffect(() => {
    setIsOnline(isConnected);
  }, [isConnected]);

  const handleSignOut = () => {
    //signOut();
    router.replace("/(auth)/sign-in");
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    setNetworkStatus(newStatus);

    if (!newStatus) {
      // Navigate to offline page when toggled to offline
      router.replace('/(app)/offline');
    }
  };

  const services = [
    { id: 1, name: "Car Towing", image: images.service1 },
    { id: 2, name: "Fuel Refill", image: images.service2 },
    { id: 3, name: "Jump Start", image: images.service3 },
    { id: 4, name: "Dead Battery", image: images.Towing },
    { id: 5, name: "Stuck in Ditch", image: images.fuel },
    { id: 6, name: "Flat Tyre", image: images.Engine },
  ];

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  // Check for network status changes while on the home screen
  useEffect(() => {
    if (!isConnected) {
      router.replace('/(app)/offline');
    }
  }, [isConnected]);

  const handleServicePress = (serviceName: string) => {
    setSelectedService(serviceName);
    router.push("/(app)/(tabs)/chatbot");
  };

  const handleViewAll = () => {
    router.push("/(app)/(tabs)/chatbot");
  };

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <View className="px-5 pb-20">
        <View className="flex flex-row items-center justify-between my-5">
          <Text className="text-2xl font-JakartaExtraBold">
            Welcome 👋
          </Text>
          <View className="flex flex-row items-center">
            <Text className="mr-2 font-JakartaMedium text-sm">
              {isOnline ? "Online" : "Offline"}
            </Text>
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`w-14 h-7 rounded-full flex justify-center px-1 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <View className={`w-5 h-5 bg-white rounded-full ${isOnline ? 'ml-auto' : 'mr-auto'}`} />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xl font-JakartaBold mb-3">
          Your current location
        </Text>
        <View className="flex flex-row items-center bg-transparent h-[300px]">
          <Map />
        </View>

        <View className="flex-row justify-between items-center mt-5 mb-3">
          <Text className="text-xl font-JakartaBold">
            Our Services
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-md font-JakartaMedium text-blue-500 underline">
              View all &gt;
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => handleServicePress(service.name)}
              className="w-[31%] mb-4 bg-white rounded-lg px-3 pb-3 shadow-sm items-center justify-center"
              style={styles.serviceCard}
            >
              <Image
                source={service.image}
                className="w-24 h-24 "
                resizeMode="contain"
              />
              <Text className="text-center font-Jakarta-ExtraBold text-sm">
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  serviceCard: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  }
});

export default Home;