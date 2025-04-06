import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useLocationStore } from "@/src/store";
import { mechanicService } from "@/src/service";
import { useAuthStore } from "@/src/state/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Map from "@/src/components/Map";
import { bookingService } from "@/src/service";

// Define TypeScript interfaces for better type safety
interface ServiceRequest {
  id: string;
  issueType: string;
  // Add other properties as needed
}

// Enum for confirmation status
enum ConfirmationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  STARTED = "STARTED"
}

interface MechanicConfirmation {
  id: string;
  serviceRequestId: string;
  distanceValue: number;
  distanceText: string;
  durationText: string;
  durationValue: number;
  estimatedCost: number;
  status: ConfirmationStatus;
  createdAt: string;
  respondedAt: string | null;
  mechanicId: string;
}

interface MechanicData {
  MechanicConfirmation: MechanicConfirmation[];
  serviceRequests: ServiceRequest[];
}

interface RequestItem {
  id: string;
  serviceRequestId: string;
  issue: string;
  distance: string;
  distanceText: string;
  earnings: number;
  status: ConfirmationStatus;
  createdAt: string;
  accepted?: boolean;
}

interface CurrentOrder {
  id: string;
  userName: string;
  userAddress: string;
  issue: string;
  earnings: number;
}

const Home = () => {
  const { setUserLocation } = useLocationStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received"); // "received" or "waiting"

  const { mechanic } = useAuthStore();
  const queryClient = useQueryClient();

  // Use React Query to fetch mechanic confirmations
  const { data: mechanicData, isLoading: isLoadingMechanic } = useQuery({
    queryKey: ['mechanicConfirmations', mechanic?.id],
    queryFn: async () => {
      if (!mechanic?.id) return null;
      const data = await mechanicService.findOne(mechanic.id, {
        MechanicConfirmation: true,
        serviceRequests: true,
      });
      return data.data as MechanicData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!mechanic?.id, // Only run if mechanic ID exists
  });

  // Define mutations for accept/reject functionality
  // const updateConfirmationMutation = useMutation({
  //   mutationFn: async ({ confirmationId, status }: { confirmationId: string, status: ConfirmationStatus }) => {
  //     if (!mechanic?.id) return null;
  //     const response = await mechanicService.update(mechanic?.id, {
  //       MechanicConfirmation: {
  //         update: {
  //           where: {
  //             id: confirmationId,
  //           },
  //           data: {
  //             status: status,
  //           }
  //         },
  //         connect:{

  //         }
  //       }




  //       // await bookingService.confirmBookingWithMechanic(confirmationId,mechanic.id)

  //     });

  //     console.log("Response from update confirmation:", response.data);

  //     return response.data as MechanicConfirmation;
  //   },
  //   onSuccess: () => {
  //     // Invalidate and refetch data after successful mutation
  //     queryClient.invalidateQueries({ queryKey: ['mechanicConfirmations', mechanic?.id] });
  //   },
  //   onError: (error) => {
  //     Alert.alert("Error", "Failed to update request status. Please try again.");
  //     console.error("Update confirmation error:", error);
  //   },
  // });

  const updateConfirmationMutation = useMutation({
    mutationFn: async ({ confirmationId, status }: { confirmationId: string, status: ConfirmationStatus }) => {
      if (!mechanic?.id) return null;
      
      // Update the status
      await mechanicService.update(mechanic.id, {
        MechanicConfirmation: {
          update: {
            where: {
              id: confirmationId,
            },
            data: {
              status: status,
            }
          }
        }
      });
              
        // Refetch the mechanic data to get the updated confirmation
        const refreshedData = await mechanicService.findOne(mechanic.id, {
          MechanicConfirmation: true
        });
        
        // Find the specific confirmation
        const updatedConfirmation = refreshedData.data.MechanicConfirmation.find(
          (confirmation : any) => confirmation.id === confirmationId
        );
        
      await bookingService.confirmBookingWithMechanic(updatedConfirmation.serviceRequestId, mechanic.id);
      console.log("Updated confirmation:", updatedConfirmation);
      
      return updatedConfirmation;
    },
    // Rest of the mutation definition remains the same
  });

  // Process the mechanic data into received (PENDING) and waiting (CONFIRMED) requests
  const [receivedRequests, setReceivedRequests] = useState<RequestItem[]>([]);
  const [waitingRequests, setWaitingRequests] = useState<RequestItem[]>([]);

  // Update state when mechanicData changes
  useEffect(() => {
    if (mechanicData?.MechanicConfirmation) {
      // Process and update the requests based on mechanicData
      const processConfirmations = () => {
        const pending: RequestItem[] = [];
        const confirmed: RequestItem[] = [];

        mechanicData.MechanicConfirmation.forEach(confirmation => {
          // Create the request item
          const requestItem: RequestItem = {
            id: confirmation.id,
            serviceRequestId: confirmation.serviceRequestId,
            issue: "Service Request", // Default value if service request is not found
            distance: (confirmation.distanceValue / 1000).toFixed(1), // Convert meters to km
            distanceText: confirmation.distanceText,
            earnings: parseFloat(confirmation.estimatedCost.toFixed(2)),
            status: confirmation.status,
            createdAt: confirmation.createdAt,
          };

          // Sort based on status
          if (confirmation.status === ConfirmationStatus.PENDING) {
            pending.push(requestItem);
          } else if (confirmation.status === ConfirmationStatus.CONFIRMED) {
            confirmed.push(requestItem);
          }
          // We ignore REJECTED status as they don't need to be displayed
        });

        setReceivedRequests(pending);
        setWaitingRequests(confirmed);
      };

      processConfirmations();
    }
  }, [mechanicData]);

  // Location permission and fetching
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
        setLocation(location.coords);

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address[0] ? `${address[0].name || ''}, ${address[0].region || ''}` : '',
        });
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAcceptRequest = (confirmationId: string) => {
    updateConfirmationMutation.mutate({
      confirmationId,
      status: ConfirmationStatus.CONFIRMED
    });

    // Optimistic UI update - show acceptance immediately
    const acceptedRequest = receivedRequests.find(req => req.id === confirmationId);
    if (acceptedRequest) {
      // Update UI immediately for better UX
      setReceivedRequests(prev => prev.filter(req => req.id !== confirmationId));
      setWaitingRequests(prev => [...prev, {
        ...acceptedRequest,
        status: ConfirmationStatus.CONFIRMED
      }]);
    }
  };

  const handleDeclineRequest = (confirmationId: string) => {
    updateConfirmationMutation.mutate({
      confirmationId,
      status: ConfirmationStatus.REJECTED
    });

    // Optimistic UI update - remove the request immediately
    setReceivedRequests(prev => prev.filter(req => req.id !== confirmationId));
  };

  const renderReceivedRequests = () => {
    return (
      <FlatList
        data={receivedRequests}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm flex flex-col gap-y-1">
            <Text className="text-xl font-JakartaBold">Issue: {item.issue}</Text>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-md font-JakartaMedium text-gray-500">Distance: {item.distanceText}</Text>
              <Text className="text-md font-JakartaMedium text-gray-500">Earnings: ${item.earnings}</Text>
            </View>
            <View className="flex-row gap-x-3 px-2 justify-between mt-3 w-full">
              <TouchableOpacity
                onPress={() => handleAcceptRequest(item.id)}
                className="bg-green-500 w-1/2 px-12 py-3 rounded-full"
                disabled={updateConfirmationMutation.isPending}
              >
                <Text className="text-white text-center font-JakartaBold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeclineRequest(item.id)}
                className="bg-red-500 px-12 w-1/2 py-3 rounded-lg"
                disabled={updateConfirmationMutation.isPending}
              >
                <Text className="text-white text-center font-JakartaBold">Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text className="text-md font-JakartaMedium text-gray-500 text-center mt-5">No pending requests</Text>
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
              <Text className="text-md font-JakartaMedium text-gray-500">Distance: {item.distanceText || `${item.distance} km away`}</Text>
              <Text className="text-md font-JakartaMedium text-gray-500">Earnings: ${item.earnings}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(app)/route")}
              className="bg-blue-500 mt-3 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-JakartaBold">Navigate to Customer</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text className="text-md font-JakartaMedium text-gray-500 text-center mt-5">No confirmed requests</Text>
        )}
        className="pb-20"
      />
    );
  };

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <ScrollView className="px-5 pb-20 flex-1">
        <Text className="text-2xl font-JakartaExtraBold my-5">Welcome 👋</Text>

        {/* Current Location Section */}
        <Text className="text-xl font-JakartaBold mb-3">Your current location</Text>
        <View className="w-full h-[200px] rounded-lg bg-gray-200 overflow-hidden mb-5">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0000ff" />
              <Text className="font-JakartaMedium mt-2">Loading your current location...</Text>
            </View>
          ) : location ? (
            <Map />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="font-JakartaMedium">Unable to get location</Text>
            </View>
          )}
        </View>

        {/* Loading indicator for mechanic data */}
        {isLoadingMechanic && (
          <View className="items-center justify-center py-3">
            <ActivityIndicator size="small" color="#0000ff" />
            <Text className="font-JakartaMedium mt-1">Updating requests...</Text>
          </View>
        )}

        {/* Show mutation loading state */}
        {updateConfirmationMutation.isPending && (
          <View className="items-center justify-center py-3 bg-blue-100 rounded-lg mb-3">
            <ActivityIndicator size="small" color="#0000ff" />
            <Text className="font-JakartaMedium mt-1">Updating request status...</Text>
          </View>
        )}

        {/* Tabs for Requests */}
        <View className="flex-row mb-3">
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "received" ? "bg-blue-500" : "bg-gray-300"} rounded-l-lg`}
            onPress={() => setActiveTab("received")}
          >
            <Text className={`text-center font-JakartaBold ${activeTab === "received" ? "text-white" : "text-gray-700"}`}>
              Pending Requests ({receivedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "waiting" ? "bg-blue-500" : "bg-gray-300"} rounded-r-lg`}
            onPress={() => setActiveTab("waiting")}
          >
            <Text className={`text-center font-JakartaBold ${activeTab === "waiting" ? "text-white" : "text-gray-700"}`}>
              Confirmed Requests ({waitingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Render active tab content */}
        {activeTab === "received" ? renderReceivedRequests() : renderWaitingRequests()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;