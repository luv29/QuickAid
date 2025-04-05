// src/hooks/useOfflineMechanics.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useLocationSetup } from "./location/useLocationSetup";
import { mechanicDiscoveryService } from "@/src/service";
import { ReactNode } from "react";

// Define constants
const BACKGROUND_FETCH_TASK = "background-fetch-mechanics";
const MECHANICS_QUERY_KEY = "offline-mechanics";
const STORAGE_KEY = "cached-mechanics-data";
const MAX_STORED_RECORDS = 10;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours TTL
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const BACKGROUND_FETCH_INTERVAL = 5 * 60; // 5 minutes in seconds

// Type definitions
interface Mechanic {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  services: string[];
  address: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    pincode: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  distance: number;
  expoToken?: string; // Optional because we'll remove it
}

interface MechanicsResponse {
  success: boolean;
  mechanics: Mechanic[];
}

interface CachedData {
  mechanics: Mechanic[];
  timestamp: number;
  expiresAt: number;
}

// Function to save mechanics to AsyncStorage with TTL
const saveMechanicsToStorage = async (mechanics: Mechanic[]) => {
  try {
    // Get existing cached data
    const existingDataString = await AsyncStorage.getItem(STORAGE_KEY);
    let existingData: CachedData[] = [];

    if (existingDataString) {
      existingData = JSON.parse(existingDataString);
    }

    // Remove sensitive data from mechanics before storing
    const sanitizedMechanics = mechanics.map((mechanic) => {
      // Create a new object without expoToken and any other sensitive fields
      const { expoToken, ...sanitizedMechanic } = mechanic;
      return sanitizedMechanic;
    });

    // Create new cache entry with 10-12 hour expiration
    const timestamp = Date.now();
    // Random TTL between 10-12 hours
    const randomTTL =
      10 * 60 * 60 * 1000 + Math.floor(Math.random() * 2 * 60 * 60 * 1000);

    const newEntry: CachedData = {
      mechanics: sanitizedMechanics,
      timestamp,
      expiresAt: timestamp + randomTTL,
    };

    // Add new entry and keep only the MAX_STORED_RECORDS most recent entries
    const updatedData = [newEntry, ...existingData]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_STORED_RECORDS);

    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    console.log(
      `Saved mechanics to AsyncStorage, expires in ${(
        randomTTL /
        (60 * 60 * 1000)
      ).toFixed(1)} hours`
    );
  } catch (error) {
    console.error("Error saving mechanics to AsyncStorage:", error);
  }
};

// Function to get the latest non-expired mechanics from AsyncStorage
const getLatestMechanicsFromStorage = async (): Promise<Mechanic[] | null> => {
  try {
    const dataString = await AsyncStorage.getItem(STORAGE_KEY);

    if (!dataString) {
      return null;
    }

    const cachedEntries: CachedData[] = JSON.parse(dataString);
    const currentTime = Date.now();

    // Find the most recent non-expired entry
    const validEntry = cachedEntries.find(
      (entry) => entry.expiresAt > currentTime
    );

    if (validEntry) {
      const hoursRemaining =
        (validEntry.expiresAt - currentTime) / (60 * 60 * 1000);
      console.log(
        `Using cached mechanics data with ${hoursRemaining.toFixed(
          1
        )} hours remaining`
      );
      return validEntry.mechanics;
    }

    // If all entries are expired, return the most recent one but mark as expired
    if (cachedEntries.length > 0) {
      console.log("All cached mechanics are expired, using most recent one");
      return cachedEntries[0].mechanics;
    }

    return null;
  } catch (error) {
    console.error("Error getting mechanics from AsyncStorage:", error);
    return null;
  }
};

// Hook to use offline mechanics
export const useOfflineMechanics = () => {
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = useState(false);
  const { getCurrentCoordinates } = useLocationSetup();

  // Function to fetch nearby mechanics from API
  const fetchMechanics = async (): Promise<Mechanic[]> => {
    try {
      const coordinates = await getCurrentCoordinates();

      if (!coordinates?.latitude || !coordinates?.longitude) {
        throw new Error("Location coordinates are not available");
      }

      const response = await mechanicDiscoveryService.findNearbyMechanics({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        serviceType: "TIRE_CHANGE", // You can make this configurable
        maxDistance: 5000,
        limit: 10,
      });

      if (!response.data.success) {
        throw new Error("Failed to fetch mechanics");
      }

      return response.data.mechanics;
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      throw error;
    }
  };

  // Initialize and register background fetch on first run
  useEffect(() => {
    // Define background task
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        console.log("[Background] Fetching mechanics...");
        const mechanics = await fetchMechanics();
        await saveMechanicsToStorage(mechanics);
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error("[Background] Error fetching mechanics:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register background task
    const registerBackgroundFetch = async () => {
      try {
        // Check if task is already registered
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
          BACKGROUND_FETCH_TASK
        );

        if (!isRegistered) {
          await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: BACKGROUND_FETCH_INTERVAL, // 5 minutes in seconds
            stopOnTerminate: false,
            startOnBoot: true,
          });
          console.log("Background fetch registered");
        } else {
          console.log("Background fetch already registered");
        }
      } catch (error) {
        console.error("Error registering background fetch:", error);
      }
    };

    registerBackgroundFetch();

    // Handle app state changes to detect when app goes offline/online
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // When app comes to the foreground, check connectivity and refetch if online
    if (nextAppState === "active") {
      try {
        await fetchMechanics();
        setIsOffline(false);
        queryClient.invalidateQueries({ queryKey: [MECHANICS_QUERY_KEY] });
      } catch (error) {
        console.log("App is offline, using cached data");
        setIsOffline(true);
      }
    }
  };

  // Main query to fetch mechanics
  const query = useQuery({
    queryKey: [MECHANICS_QUERY_KEY],
    queryFn: async () => {
      try {
        const mechanics = await fetchMechanics();
        await saveMechanicsToStorage(mechanics);
        setIsOffline(false);
        return mechanics;
      } catch (error) {
        // If fetch fails, get from AsyncStorage
        setIsOffline(true);
        const cachedMechanics = await getLatestMechanicsFromStorage();
        if (cachedMechanics) {
          return cachedMechanics;
        }
        throw new Error("Unable to get mechanics, both API and cache failed");
      }
    },
    refetchInterval: FETCH_INTERVAL, // 5 minutes in milliseconds
    staleTime: FETCH_INTERVAL / 2, // 2.5 minutes
  });

  return {
    ...query,
    isOffline,
    forceFetch: () =>
      queryClient.invalidateQueries({ queryKey: [MECHANICS_QUERY_KEY] }),
    clearCache: async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log("Mechanics cache cleared");
        queryClient.invalidateQueries({ queryKey: [MECHANICS_QUERY_KEY] });
      } catch (error) {
        console.error("Error clearing mechanics cache:", error);
      }
    },
  };
};

// Export a provider component for easier usage in the app
export const OfflineMechanicsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up polling when the provider mounts
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: [MECHANICS_QUERY_KEY] });
    }, FETCH_INTERVAL); // 5 minutes

    return () => clearInterval(intervalId);
  }, [queryClient]);

  return children;
};
