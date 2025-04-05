import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PermissionStatus } from "expo-location";

export interface Geolocation {
  name: string;
  city: string;
  district: string;
  region: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

const asyncStorageAdapter = {
  getItem: async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value || null;
    } catch (error) {
      console.error("Error reading from AsyncStorage:", error);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error("Error writing to AsyncStorage:", error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error("Error removing from AsyncStorage:", error);
    }
  },
};

interface LocationStore {
  locationPermissionStatus: PermissionStatus;
  setLocationPermissionStatus: (value: PermissionStatus) => void;
  geolocation: Geolocation | null;
  setGeolocation: (geolocation: Geolocation) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      locationPermissionStatus: PermissionStatus.GRANTED,

      setLocationPermissionStatus: (status: PermissionStatus) =>
        set({ locationPermissionStatus: status }),

      geolocation: null,

      setGeolocation: (geolocation: Geolocation) =>
        set({ geolocation: geolocation }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
