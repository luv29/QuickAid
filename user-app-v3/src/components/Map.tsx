import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import Constants from 'expo-constants';

// TypeScript interfaces
interface Mechanic {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const Map: React.FC = () => {
  // Use component state instead of store to ensure data is available
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyMechanics, setNearbyMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get Google Maps API key from environment variables
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey || '';

  useEffect(() => {
    let isMounted = true;

    const getLocationData = async (): Promise<void> => {
      console.log("Starting location fetch process...");
      setIsLoading(true);

      try {
        // Request permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("Permission status:", status);

        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to show the map."
          );
          setIsLoading(false);
          return;
        }

        // Get current location
        console.log("Getting current position...");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        console.log("Location obtained:", location.coords);

        if (isMounted) {
          // Set user location directly in component state
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          // Generate nearby mechanics
          generateNearbyMechanics(location.coords.latitude, location.coords.longitude);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in location process:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getLocationData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to generate random nearby mechanics
  const generateNearbyMechanics = (latitude: number, longitude: number): void => {
    if (!latitude || !longitude) {
      console.log("No coordinates for mechanics");
      return;
    }

    const mechanics: Mechanic[] = [];

    // Generate 4 random mechanics in the vicinity
    for (let i = 0; i < 4; i++) {
      // Generate random offsets (approximately within 3 km)
      const latOffset = (Math.random() - 0.5) * 0.06;
      const longOffset = (Math.random() - 0.5) * 0.06;

      mechanics.push({
        id: i + 1,
        name: `Mechanic ${i + 1}`,
        latitude: latitude + latOffset,
        longitude: longitude + longOffset,
      });
    }

    console.log("Generated mechanics:", mechanics);
    setNearbyMechanics(mechanics);
  };

  // If still loading, show loading message
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Getting your location...</Text>
      </View>
    );
  }

  // If no user location available yet, show message
  if (!userLocation) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Unable to determine your location.</Text>
      </View>
    );
  }

  console.log("Rendering map with location:", userLocation);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={[
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
          }
        ]}
      >
        {/* User marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
          pinColor="red"
        />

        {/* Mechanic markers */}
        {nearbyMechanics.map((mechanic) => (
          <Marker
            key={mechanic.id}
            coordinate={{
              latitude: mechanic.latitude,
              longitude: mechanic.longitude,
            }}
            title={mechanic.name}
            description="Available mechanic"
            pinColor="blue"
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default Map;