import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useLocationStore } from "@/src/store";

const Home = () => {
  const { setUserLocation } = useLocationStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received"); // "received" or "waiting"
  
  // Current order the mechanic is fulfilling
  const [currentOrder, setCurrentOrder] = useState({
    id: "current1",
    userName: "John Smith",
    userAddress: "123 Main St, Springfield",
    issue: "Flat Tyre",
    earnings: 25,
  });
  
  const [receivedRequests, setReceivedRequests] = useState([
    { id: "1", issue: "Flat Tyre", distance: 3.2, earnings: 15, accepted: false },
    { id: "2", issue: "Dead Battery", distance: 5.5, earnings: 20, accepted: false },
    { id: "3", issue: "Stuck in Ditch", distance: 2.1, earnings: 25, accepted: false },
    { id: "4", issue: "Dead Battery", distance: 5.5, earnings: 20, accepted: false },
    { id: "5", issue: "Stuck in Ditch", distance: 2.1, earnings: 25, accepted: false },
  ]);
  
  const [waitingRequests, setWaitingRequests] = useState([
    { id: "6", issue: "Engine Failure", distance: 4.0, earnings: 30 },
    { id: "7", issue: "Keys Locked Inside", distance: 1.8, earnings: 18 },
  ]);
  
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }
      setHasPermission(true); 
      try {
        let location = await Location.getCurrentPositionAsync({});
        console.log(location.coords);
        setLocation(location.coords);

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: `${address[0].name}, ${address[0].region}`,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAcceptRequest = (requestId) => {
    setReceivedRequests(prevRequests => prevRequests.map(req =>
      req.id === requestId ? { ...req, accepted: true } : req
    ));
    
    // Move to waiting requests after accepting
    const acceptedRequest = receivedRequests.find(req => req.id === requestId);
    if (acceptedRequest) {
      setWaitingRequests(prev => [...prev, {...acceptedRequest, accepted: undefined}]);
      setTimeout(() => {
        setReceivedRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      }, 1000);
    }
  };

  const handleDeclineRequest = (requestId) => {
    setReceivedRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
  };

  const renderReceivedRequests = () => {
    return (
      <FlatList
        data={receivedRequests}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm flex flex-col gap-y-1">
            <Text className="text-xl font-JakartaBold">Issue: {item.issue}</Text>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-md font-JakartaMedium text-gray-500">Distance: {item.distance} km away</Text>
              <Text className="text-md font-JakartaMedium text-gray-500">Earnings: ${item.earnings}</Text>
            </View>
            <View className="flex-row gap-x-3 px-2 justify-between mt-3 w-full">
              <TouchableOpacity
                onPress={() => handleAcceptRequest(item.id)}
                className="bg-green-500 w-1/2 px-12 py-3 rounded-full"
              >
                <Text className="text-white text-center font-JakartaBold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeclineRequest(item.id)}
                className="bg-red-500 px-12 w-1/2 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-JakartaBold">Decline</Text>
              </TouchableOpacity>
            </View>
            {item.accepted && (
              <TouchableOpacity
                onPress={() => router.push("/route")} 
                className="bg-blue-500 mt-3 ml-2 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-JakartaBold">See the Route</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text className="text-md font-JakartaMedium text-gray-500 text-center mt-5">No received requests</Text>
        )}
        className="pb-20"
      />
    );
  };

  const renderWaitingRequests = () => {
    return (
      <FlatList
        data={waitingRequests}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm flex flex-col gap-y-1">
            <Text className="text-xl font-JakartaBold">Issue: {item.issue}</Text>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-md font-JakartaMedium text-gray-500">Distance: {item.distance} km away</Text>
              <Text className="text-md font-JakartaMedium text-gray-500">Earnings: ${item.earnings}</Text>
            </View>
            <Text className="text-sm italic text-amber-600 mt-2 text-center">Waiting for customer confirmation</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text className="text-md font-JakartaMedium text-gray-500 text-center mt-5">No waiting requests</Text>
        )}
        className="pb-20"
      />
    );
  };

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <ScrollView className="px-5 pb-20 flex-1">
        <Text className="text-2xl font-JakartaExtraBold my-5">Welcome 👋</Text>
        
        {/* Current Order Section */}
        {currentOrder && (
          <View className="bg-blue-100 rounded-lg p-4 mb-4 shadow-md">
            <Text className="text-xl font-JakartaBold mb-3">Current Order</Text>
            <View className="flex flex-row justify-between mb-2">
              <Text className="font-JakartaBold">Customer: {currentOrder.userName}</Text>
              <Text className="font-JakartaBold">Issue: {currentOrder.issue}</Text>
            </View>
            <Text className="font-JakartaMedium mb-2">Address: {currentOrder.userAddress}</Text>
            <View className="flex flex-row justify-between mb-2">
              <Text className="font-JakartaMedium">Earnings: ${currentOrder.earnings}</Text>
              <Text className="font-JakartaMedium text-green-600">In Progress</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(app)/route")}
              className="bg-blue-500 mt-2 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-JakartaBold">Navigate to Customer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Current Location Section */}
        <Text className="text-xl font-JakartaBold mb-3">Your current location</Text>
        <View className="w-full h-[200px] rounded-lg bg-gray-200 overflow-hidden mb-5">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0000ff" />
              <Text className="font-JakartaMedium mt-2">Loading your current location...</Text>
            </View>
          ) : location ? (
            <Image
              source={{
                uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${location.longitude},${location.latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
              }}
              className="w-full h-full"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="font-JakartaMedium">Unable to get location</Text>
            </View>
          )}
        </View>

        {/* Tabs for Requests */}
        <View className="flex-row mb-3">
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === "received" ? "bg-blue-500" : "bg-gray-300"} rounded-l-lg`}
            onPress={() => setActiveTab("received")}
          >
            <Text className={`text-center font-JakartaBold ${activeTab === "received" ? "text-white" : "text-gray-700"}`}>
              Received Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === "waiting" ? "bg-blue-500" : "bg-gray-300"} rounded-r-lg`}
            onPress={() => setActiveTab("waiting")}
          >
            <Text className={`text-center font-JakartaBold ${activeTab === "waiting" ? "text-white" : "text-gray-700"}`}>
              Waiting for Confirmation
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Render active tab content */}
        {activeTab === "received" ? renderReceivedRequests() : renderWaitingRequests()}
      </ScrollView >
    </SafeAreaView>
  );
};

export default Home;