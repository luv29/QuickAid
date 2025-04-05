import React from "react";
import {
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/src/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mechanicService } from "@/src/service"; // Adjust import path as needed

// Type definitions
interface ServiceRequest {
  id: string;
  userId: string;
  mechanicId?: string | null;
  serviceType: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MechanicConfirmation {
  id: string;
  serviceRequestId: string;
  mechanicId: string;
  status: "CONFIRMED" | "REJECTED" | "PENDING";
  distanceText: string;
  distanceValue: number;
  durationText: string;
  durationValue: number;
  estimatedCost: number;
  createdAt: string;
  respondedAt: string | null;
  serviceRequest?: ServiceRequest; // This will be populated if we join the data
}

interface MechanicData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  services: string[];
  MechanicConfirmation: MechanicConfirmation[];
  serviceRequests: ServiceRequest[];
  // Other fields as needed
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Status to display mapping
const getStatusDisplay = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return { text: "Confirmed", bgColor: "bg-green-100", textColor: "text-green-700" };
    case "REJECTED":
      return { text: "Rejected", bgColor: "bg-red-100", textColor: "text-red-700" };
    default:
      return { text: "Pending", bgColor: "bg-blue-100", textColor: "text-blue-700" };
  }
};

// Convert service type to readable format
const formatServiceType = (serviceType: string) => {
  const serviceTypes: Record<string, string> = {
    "LOCKOUT": "Lockout Service",
    "BATTERY_JUMP": "Battery Jump",
    "FUEL_DELIVERY": "Fuel Delivery",
    "JUMP_START": "Jump Start",
    "TOW": "Towing Service",
    "CUSTOM_SERVICE": "Custom Service",
    // Add more service types as needed
  };

  return serviceTypes[serviceType] || serviceType;
};

// Function to get service request details from the confirmation id
const getServiceRequestFromConfirmations = (
  confirmations: MechanicConfirmation[],
  serviceRequests: ServiceRequest[],
  confirmationId: string
): ServiceRequest | undefined => {
  const confirmation = confirmations.find(c => c.id === confirmationId);
  if (!confirmation) return undefined;

  return serviceRequests.find(sr => sr.id === confirmation.serviceRequestId);
};

const JobCard = ({
  confirmation,
  serviceRequests
}: {
  confirmation: MechanicConfirmation,
  serviceRequests: ServiceRequest[]
}) => {
  const status = getStatusDisplay(confirmation.status);

  // Try to find the associated service request
  const serviceRequest = serviceRequests.find(sr => sr.id === confirmation.serviceRequestId);

  return (
    <View className="flex flex-col bg-white rounded-lg shadow-sm shadow-neutral-300 mb-4 overflow-hidden">
      <View className="p-3">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-200 items-center justify-center mr-2">
              <Image
                source={icons.target}
                className="w-6 h-6"
              />
            </View>
            <Text className="text-lg font-JakartaBold">
              {serviceRequest ? formatServiceType(serviceRequest.serviceType) : "Service"}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${status.bgColor}`}>
            <Text className={`text-xs font-JakartaMedium capitalize ${status.textColor}`}>
              {status.text}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start justify-between mb-3">
          {/* Show map if we have coordinates */}
          {serviceRequest && process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ? (
            <Image
              source={{
                uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${serviceRequest.longitude},${serviceRequest.latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
              }}
              className="w-[90px] h-[76px] rounded-lg border"
            />
          ) : (
            <View className="w-[90px] h-[76px] rounded-lg border bg-gray-100 items-center justify-center">
              <Image source={icons.location} className="w-8 h-8 opacity-50" />
            </View>
          )}

          <View className="flex flex-col mx-1 gap-y-3 flex-1">
            <View className="flex flex-row items-center gap-x-1">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={2}>
                {serviceRequest?.address || confirmation.distanceText + " away"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium ml-1">
                {formatDate(confirmation.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Request ID</Text>
            <Text className="text-md font-JakartaBold">{confirmation.serviceRequestId.slice(-6)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Time</Text>
            <Text className="text-md font-JakartaBold">{formatTime(confirmation.createdAt)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Estimated Cost</Text>
            <Text className="text-md font-JakartaBold">${confirmation.estimatedCost.toFixed(2)}</Text>
          </View>

          {confirmation.respondedAt && (
            <View className="flex-row justify-between mt-2">
              <Text className="text-md font-JakartaMedium text-gray-500">Responded At</Text>
              <Text className="text-md font-JakartaBold">{formatTime(confirmation.respondedAt)}</Text>
            </View>
          )}

          {serviceRequest && (
            <View className="flex-row justify-between mt-2">
              <Text className="text-md font-JakartaMedium text-gray-500">Status</Text>
              <Text className="text-md font-JakartaBold">{serviceRequest.status.replace(/_/g, " ")}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const Bookings = () => {
  // Get mechanic data from context or async storage
  const mechanic = { id: "67eeaa5d3b4da9eda2f62e78" }; // Replace with actual mechanic data retrieval

  const { data: mechanicData, isLoading: isLoadingMechanic } = useQuery({
    queryKey: ['mechanicConfirmations', mechanic?.id],
    queryFn: async () => {
      if (!mechanic?.id) return null;
      const data = await mechanicService.findOne(mechanic.id, {
        MechanicConfirmation: true,
        serviceRequests: true,
      });
      console.log("Mechanic data:", data.data);
      return data.data as MechanicData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!mechanic?.id, // Only run if mechanic ID exists
  });

  // Extract confirmation data for rendering
  const confirmations = mechanicData?.MechanicConfirmation || [];
  const serviceRequests = mechanicData?.serviceRequests || [];

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <View className="pt-4 px-5">
        <Text className="text-2xl font-JakartaBold mb-2">Previous Requests</Text>
      </View>

      {isLoadingMechanic ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3498db" />
          <Text className="mt-4 text-md font-JakartaMedium">Loading your requests...</Text>
        </View>
      ) : (
        <FlatList
          data={confirmations}
          renderItem={({ item }) => (
            <JobCard
              confirmation={item}
              serviceRequests={serviceRequests}
            />
          )}
          keyExtractor={(item) => item.id}
          className="px-5"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 100,
          }}
          ListEmptyComponent={() => (
            <View className="flex flex-col items-center justify-center py-10">
              <Image
                source={icons.emptyList}
                className="w-16 h-16 opacity-50"
              />
              <Text className="text-md font-JakartaMedium mt-3">No request history found</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Bookings;