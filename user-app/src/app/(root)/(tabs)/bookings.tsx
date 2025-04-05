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
import { icons,images } from "@/src/constants";

// Service booking history item type
interface ServiceBooking {
  booking_id: string;
  service_type: string; 
  booking_location: string;
  booking_status: "completed" | "canceled" | "in-progress";
  price: number;
  booking_date: string;
  location_latitude: number;
  location_longitude: number;
  mechanic: {
    mechanic_id: string;
    first_name: string;
    last_name: string;
    rating: string;
    specialization: string;
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

// Properly format time without using toFixed on undefined
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Dummy data for bookings
const bookingHistory: ServiceBooking[] = [
  {
    booking_id: "B12345",
    service_type: "Jump Start",
    booking_location: "1234 Maple Avenue, Portland",
    booking_status: "completed",
    price: 75.00,
    booking_date: "2024-07-25 14:30:20",
    location_latitude: 45.523064,
    location_longitude: -122.676483,
    mechanic: {
      mechanic_id: "M1001",
      first_name: "John",
      last_name: "Diaz",
      rating: "4.85",
      specialization: "Battery & Electrical"
    }
  },
  {
    booking_id: "B12346",
    service_type: "Flat Tyre",
    booking_location: "Highway 101, Mile 42",
    booking_status: "completed",
    price: 95.50,
    booking_date: "2024-07-10 08:15:42",
    location_latitude: 37.774929,
    location_longitude: -122.419418,
    mechanic: {
      mechanic_id: "M1002",
      first_name: "Maria",
      last_name: "Sanders",
      rating: "4.92",
      specialization: "Tire Specialist"
    }
  },
  {
    booking_id: "B12347",
    service_type: "Fuel Refill",
    booking_location: "County Road 25, Near Downtown",
    booking_status: "completed",
    price: 60.00,
    booking_date: "2024-06-30 17:22:10",
    location_latitude: 40.712776,
    location_longitude: -74.005974,
    mechanic: {
      mechanic_id: "M1003",
      first_name: "Robert",
      last_name: "Johnson",
      rating: "4.78",
      specialization: "General Assistance"
    }
  },
  {
    booking_id: "B12348",
    service_type: "Car Towing",
    booking_location: "456 Oak Street, Seattle",
    booking_status: "completed",
    price: 125.00,
    booking_date: "2024-06-15 11:45:32",
    location_latitude: 47.606209,
    location_longitude: -122.332069,
    mechanic: {
      mechanic_id: "M1004",
      first_name: "Lisa",
      last_name: "Williams",
      rating: "4.95",
      specialization: "Towing Expert"
    }
  },
  {
    booking_id: "B12349",
    service_type: "Dead Battery",
    booking_location: "Mall Parking Lot, Riverside",
    booking_status: "canceled",
    price: 65.00,
    booking_date: "2024-06-05 14:10:20",
    location_latitude: 33.980602,
    location_longitude: -117.375496,
    mechanic: {
      mechanic_id: "M1005",
      first_name: "Michael",
      last_name: "Chen",
      rating: "4.82",
      specialization: "Battery & Electrical"
    }
  }
];

const BookingCard = ({ booking }: { booking: ServiceBooking }) => {
  return (
    <View className="flex flex-col bg-white rounded-lg shadow-sm shadow-neutral-300 mb-4 overflow-hidden">
      {/* Main content */}
      <View className="p-3">
        {/* Header with service type and booking ID */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-200 items-center justify-center mr-2">
              <Image 
                source={icons.target} 
                className="w-6 h-6"
              />
            </View>
            <Text className="text-lg font-JakartaBold"> Issue: {booking.service_type}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${
            booking.booking_status === "completed" ? "bg-green-100" : 
            booking.booking_status === "in-progress" ? "bg-blue-100" : "bg-red-100"
          }`}>
            <Text className={`text-xs font-JakartaMedium capitalize ${
              booking.booking_status === "completed" ? "text-green-700" : 
              booking.booking_status === "in-progress" ? "text-blue-700" : "text-red-700"
            }`}>
              {booking.booking_status}
            </Text>
          </View>
        </View>

        {/* Map and Location */}
        <View className="flex-row items-start justify-between mb-3">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${booking.location_longitude},${booking.location_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[90px] h-[76px] rounded-lg border"
          />
          
          <View className="flex flex-col mx-1 gap-y-3 flex-1">
            <View className="flex flex-row items-center gap-x-1">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={2}>
                {booking.booking_location}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium ml-1">
                {formatDate(booking.booking_date)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Booking details */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Booking ID</Text>
            <Text className="text-md font-JakartaBold">{booking.booking_id}</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Time</Text>
            <Text className="text-md font-JakartaBold">{formatTime(booking.booking_date)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-md font-JakartaMedium text-gray-500">Service Fee</Text>
            <Text className="text-md font-JakartaBold">${booking.price.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Mechanic</Text>
            <View className="flex-row items-center">
              <Text className="text-md font-JakartaBold mr-2">
                {booking.mechanic.first_name} {booking.mechanic.last_name}
              </Text>
              <Image source={icons.star} className="w-5 h-5 mr-1" />
              <Text className="text-sm font-JakartaMedium">{booking.mechanic.rating}</Text>
            </View>
          </View>
        </View>
        
        {/* Specialization / Additional Details */}
        <View className="bg-blue-50 rounded-lg p-3">
          <Text className="text-sm font-JakartaBold text-blue-700 mb-1">Mechanic Specialization</Text>
          <Text className="text-md font-JakartaMedium text-blue-900">
            {booking.mechanic.specialization}
          </Text>
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
        data={bookingHistory}
        renderItem={({ item }) => <BookingCard booking={item} />}
        keyExtractor={(item) => item.booking_id}
        className="px-5"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center py-10">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No bookings found"
                  resizeMode="contain"
                />
                <Text className="text-md font-JakartaMedium mt-3">No booking history found</Text>
                <Text className="text-sm font-JakartaRegular text-gray-500 text-center mt-1">
                  You haven't made any roadside assistance bookings yet
                </Text>
              </>
            ) : (
              <ActivityIndicator size="large" color="#3498db" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <View className="my-5">
            <Text className="text-2xl font-JakartaExtraBold">Booking History</Text>
            <Text className="text-md font-JakartaMedium text-gray-500 mt-1">
              View your past roadside assistance requests
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Bookings;