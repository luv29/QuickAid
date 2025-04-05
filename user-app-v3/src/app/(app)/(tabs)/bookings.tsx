import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/src/constants";
import { useQuery } from "@tanstack/react-query";
import { servicesRequestService } from "@/src/service";
import { useAuthStore } from "@/src/state/useAuth";

// Service request type based on your schema
interface ServiceRequest {
  id: string;
  userId: string;
  mechanicId?: string;
  serviceType: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "REQUESTED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  createdAt: string;
  updatedAt: string;
  mechanic?: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: string;
    specialization?: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    paymentMethod?: string;
  };
}

// Properly format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Properly format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return {
        bg: "bg-green-100",
        text: "text-green-700"
      };
    case "CANCELED":
      return {
        bg: "bg-red-100",
        text: "text-red-700"
      };
    case "IN_PROGRESS":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700"
      };
    case "ASSIGNED":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700"
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700"
      };
  }
};

const ServiceRequestCard = ({ request }: { request: ServiceRequest }) => {
  const statusStyle = getStatusColor(request.status);

  return (
    <View className="flex flex-col bg-white rounded-lg shadow-sm shadow-neutral-300 mb-4 overflow-hidden">
      {/* Main content */}
      <View className="p-3">
        {/* Header with service type and request ID */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-200 items-center justify-center mr-2">
              <Image
                source={icons.target}
                className="w-6 h-6"
              />
            </View>
            <Text className="text-lg font-JakartaBold">Issue: {request.serviceType}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-xs font-JakartaMedium capitalize ${statusStyle.text}`}>
              {request.status.toLowerCase().replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Map and Location */}
        <View className="flex-row items-start justify-between mb-3">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${request.longitude},${request.latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[90px] h-[76px] rounded-lg border"
          />

          <View className="flex flex-col mx-1 gap-y-3 flex-1">
            <View className="flex flex-row items-center gap-x-1">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={2}>
                {request.address || "Location Address Unavailable"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium ml-1">
                {formatDate(request.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Request details */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Request ID</Text>
            <Text className="text-md font-JakartaBold">{request.id.slice(-6).toUpperCase()}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Time</Text>
            <Text className="text-md font-JakartaBold">{formatTime(request.createdAt)}</Text>
          </View>

          {request.payment && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-md font-JakartaMedium text-gray-500">Service Fee</Text>
              <Text className="text-md font-JakartaBold">${request.payment.amount.toFixed(2)}</Text>
            </View>
          )}

          {request.mechanic && (
            <View className="flex-row justify-between">
              <Text className="text-md font-JakartaMedium text-gray-500">Mechanic</Text>
              <View className="flex-row items-center">
                <Text className="text-md font-JakartaBold mr-2">
                  {request.mechanic.firstName} {request.mechanic.lastName}
                </Text>
                {request.mechanic.rating && (
                  <>
                    <Image source={icons.star} className="w-5 h-5 mr-1" />
                    <Text className="text-sm font-JakartaMedium">{request.mechanic.rating}</Text>
                  </>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Description / Additional Details */}
        {request.description && (
          <View className="bg-blue-50 rounded-lg p-3">
            <Text className="text-sm font-JakartaBold text-blue-700 mb-1">Service Description</Text>
            <Text className="text-md font-JakartaMedium text-blue-900">
              {request.description}
            </Text>
          </View>
        )}

        {/* Mechanic Specialization (if available) */}
        {request.mechanic?.specialization && (
          <View className="bg-blue-50 rounded-lg p-3 mt-3">
            <Text className="text-sm font-JakartaBold text-blue-700 mb-1">Mechanic Specialization</Text>
            <Text className="text-md font-JakartaMedium text-blue-900">
              {request.mechanic.specialization}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ServiceRequestHistory = () => {
  const { user } = useAuthStore();

  const { data: serviceRequests, isLoading, isError } = useQuery({
    queryKey: ['serviceRequests', user?.id],
    queryFn: async () => {
      // Only proceed if user is logged in
      if (!user?.id) return [];

      const response = await servicesRequestService.findMany({
        where: {
          userId: user.id,
        },
        include: {
          mechanic: true,
          payment: true
        }
      });
      console.log("Service Requests:", response.data);

      return response.data || [];
    },
    enabled: !!user?.id
  });

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <FlatList
        data={serviceRequests}
        renderItem={({ item }) => <ServiceRequestCard request={item} />}
        keyExtractor={(item) => item.id}
        className="px-5"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center py-10">
            {isLoading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : isError ? (
              <>
                {/* <Image
                  source={images.error || require('@/src/assets/images/error.png')}
                  className="w-40 h-40"
                  alt="Error loading requests"
                  resizeMode="contain"
                /> */}
                <Text className="text-md font-JakartaMedium mt-3">Failed to load service requests</Text>
                <Text className="text-sm font-JakartaRegular text-gray-500 text-center mt-1">
                  There was an error loading your service request history
                </Text>
              </>
            ) : (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No requests found"
                  resizeMode="contain"
                />
                <Text className="text-md font-JakartaMedium mt-3">No service requests found</Text>
                <Text className="text-sm font-JakartaRegular text-gray-500 text-center mt-1">
                  You haven't made any roadside assistance requests yet
                </Text>
              </>
            )}
          </View>
        )}
        ListHeaderComponent={
          <View className="my-5">
            <Text className="text-2xl font-JakartaExtraBold">Service History</Text>
            <Text className="text-md font-JakartaMedium text-gray-500 mt-1">
              View your past roadside assistance requests
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ServiceRequestHistory;