import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "@/src/store";

const RouteScreen = () => {
  const { userLatitude, userLongitude, userAddress } = useLocationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState("--");
  const [distance, setDistance] = useState("--");
  
  // For demo purposes - Dumas Beach, Surat coordinates
  const customerLocation = {
    latitude: 20.8295, 
    longitude: 72.5175,
    address: "Dumas Beach, Surat, Gujarat"
  };
  
  // Function to properly decode Google Maps polyline
  const decodePolyline = (encoded) => {
    let index = 0;
    const len = encoded.length;
    const points = [];
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }

    return points;
  };
  
  // Get directions between mechanic and customer
  useEffect(() => {
    const fetchDirections = async () => {
      if (!userLatitude || !userLongitude) {
        setError("Mechanic location not available");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching directions from ${userLatitude},${userLongitude} to ${customerLocation.latitude},${customerLocation.longitude}`);
        
        // Replace with your actual Google Maps API key
        // Make sure this API key has Directions API enabled
        const apiKey = "AIzaSyDwBWkRrX9vBHjQrqo0fJbA1I6Fn7JipMg"; // IMPORTANT: Replace this with your valid API key
        
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${customerLocation.latitude},${customerLocation.longitude}&key=${apiKey}`;
        
        console.log("Requesting URL:", url);
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log("Directions API response status:", result.status);
        
        if (result.status !== "OK") {
          console.error("Directions API error:", result);
          throw new Error(result.error_message || "Failed to get directions");
        }
        
        if (result.routes && result.routes.length > 0) {
          // Decode the polyline points
          const points = result.routes[0].overview_polyline.points;
          const decodedPoints = decodePolyline(points);
          
          // Extract duration and distance
          if (result.routes[0].legs && result.routes[0].legs.length > 0) {
            const leg = result.routes[0].legs[0];
            setEstimatedTime(leg.duration.text);
            setDistance(leg.distance.text);
          }
          
          setRoute(decodedPoints);
        } else {
          throw new Error("No routes found");
        }
      } catch (err) {
        console.error("Error fetching directions:", err);
        setError("Failed to load directions: " + (err.message || "Unknown error"));
        
        // Fallback to straight line for demo purposes
        if (userLatitude && userLongitude) {
          setRoute([
            { latitude: userLatitude, longitude: userLongitude },
            { latitude: customerLocation.latitude, longitude: customerLocation.longitude }
          ]);
          setEstimatedTime("~15 min");
          setDistance("~5.2 km");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDirections();
  }, [userLatitude, userLongitude]);
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading directions...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: (userLatitude + customerLocation.latitude) / 2,
          longitude: (userLongitude + customerLocation.longitude) / 2,
          latitudeDelta: Math.abs(userLatitude - customerLocation.latitude) * 1.5,
          longitudeDelta: Math.abs(userLongitude - customerLocation.longitude) * 1.5,
        }}
        mapType="standard"
      >
        {/* Mechanic marker */}
        <Marker
          coordinate={{
            latitude: userLatitude,
            longitude: userLongitude,
          }}
          title="Your Location"
          description={userAddress || "Mechanic's current location"}
          pinColor="blue"
        />
        
        {/* Customer marker */}
        <Marker
          coordinate={{
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
          }}
          title="Customer Location"
          description={customerLocation.address}
          pinColor="red"
        />
        
        {/* Route polyline */}
        {route && (
          <Polyline
            coordinates={route}
            strokeColor="#0066CC"
            strokeWidth={4}
          />
        )}
      </MapView>
      
      {/* Navigation Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Navigating to Customer</Text>
        <Text style={styles.infoAddress}>{customerLocation.address}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{estimatedTime}</Text>
            <Text style={styles.infoLabel}>Estimated Time</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{distance}</Text>
            <Text style={styles.infoLabel}>Distance</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'JakartaMedium',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'JakartaMedium',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'JakartaBold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'JakartaBold',
    marginBottom: 5,
  },
  infoAddress: {
    fontSize: 14,
    fontFamily: 'JakartaMedium',
    color: '#555',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontFamily: 'JakartaBold',
    color: '#0066CC',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'JakartaMedium',
    color: '#777',
  },
});

export default RouteScreen;