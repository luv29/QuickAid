import React from "react";
import {
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/src/constants";

// Mechanic job history item type
interface MechanicJob {
  job_id: string;
  service_type: string;
  job_location: string;
  job_status: "completed" | "canceled" | "in-progress";
  earnings: number;
  job_date: string;
  location_latitude: number;
  location_longitude: number;
  user_protected: boolean;
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

// Dummy data for mechanic jobs
const jobHistory: MechanicJob[] = [
  {
    job_id: "J1001",
    service_type: "Jump Start",
    job_location: "1234 Maple Avenue, Portland",
    job_status: "completed",
    earnings: 75.00,
    job_date: "2024-07-25 14:30:20",
    location_latitude: 45.523064,
    location_longitude: -122.676483,
    user_protected: true,
  },
  {
    job_id: "J1002",
    service_type: "Flat Tyre",
    job_location: "Highway 101, Mile 42",
    job_status: "completed",
    earnings: 95.50,
    job_date: "2024-07-10 08:15:42",
    location_latitude: 37.774929,
    location_longitude: -122.419418,
    user_protected: false,
  }
];

const JobCard = ({ job }: { job: MechanicJob }) => {
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
            <Text className="text-lg font-JakartaBold"> Service: {job.service_type}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${
            job.job_status === "completed" ? "bg-green-100" : 
            job.job_status === "in-progress" ? "bg-blue-100" : "bg-red-100"
          }`}>
            <Text className={`text-xs font-JakartaMedium capitalize ${
              job.job_status === "completed" ? "text-green-700" : 
              job.job_status === "in-progress" ? "text-blue-700" : "text-red-700"
            }`}>
              {job.job_status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start justify-between mb-3">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${job.location_longitude},${job.location_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[90px] h-[76px] rounded-lg border"
          />
          
          <View className="flex flex-col mx-1 gap-y-3 flex-1">
            <View className="flex flex-row items-center gap-x-1">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={2}>
                {job.user_protected ? "Confidential Location" : job.job_location}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium ml-1">
                {formatDate(job.job_date)}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Job ID</Text>
            <Text className="text-md font-JakartaBold">{job.job_id}</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Time</Text>
            <Text className="text-md font-JakartaBold">{formatTime(job.job_date)}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Earnings</Text>
            <Text className="text-md font-JakartaBold">${job.earnings.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const Bookings = () => {
  const loading = false;

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <FlatList
        data={jobHistory}
        renderItem={({ item }) => <JobCard job={item} />}
        keyExtractor={(item) => item.job_id}
        className="px-5"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center py-10">
            {!loading ? (
              <Text className="text-md font-JakartaMedium mt-3">No job history found</Text>
            ) : (
              <ActivityIndicator size="large" color="#3498db" />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default  Bookings;
