import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  password?: string;
  cars?: any[]; // Replace 'any' with a proper Car type if available
  serviceRequests?: any[]; // Replace 'any' with a proper ServiceRequest type if available
  emergencyContacts?: any[]; // Replace 'any' with a proper EmergencyContact type if available
  reviews?: any[]; // Replace 'any' with a proper Review type if available
  sentMessages?: any[]; // Replace 'any' with a proper Message type if available
  sosEvents?: any[]; // Replace 'any' with a proper SOSEvent type if available
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  refreshUser: (userId: string) => Promise<void>;
  clearUser: () => void;
}

// Custom storage adapter for SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user: User) => {
        const isAuthenticated = user && Object.keys(user).length > 0;
        set({ user, isAuthenticated });
      },
      
      refreshUser: async (userId: string) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.get(
            `http://localhost:8001/api/users/${userId}`
          );
          set({ user: data.user });
        } catch (error) {
          console.error(error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);