import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Car, EmergencyContact, ServiceRequest, SOS } from "@quick-aid/core";
import {
  AUTH_TOKEN_KEY,
} from "@/src/constants/secureStoreKeys";
import { userService } from "@/src/service";

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  cars?: Car[];
  serviceRequests?: ServiceRequest[];
  emergencyContacts?: EmergencyContact[];
  sosEvents?: SOS[];
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;

  updateEmergencyContacts: (contacts: EmergencyContact[]) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (contactId: string) => void;
  setToken: (token: string | null) => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  getUser: () => User | null;
  refreshUser: () => Promise<void>;
  resetState: () => Promise<void>;
}

export const useAuthStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  getUser: () => get().user,

  setUser: (user) => set({ user }),

  updateUser: (userData) => {
    const { user } = get();

    if (!user) return;

    set({
      user: {
        ...user,
        ...userData,
      },
    });
  },


 

  updateEmergencyContacts: (emergencyContacts) => {
    const { user } = get();

    if (!user) return;

    set({
      user: {
        ...user,
        emergencyContacts,
      },
    });
  },

  addEmergencyContact: (contact) => {
    const { user } = get();

    if (!user) return;

    set({
      user: {
        ...user,
        emergencyContacts: [...(user.emergencyContacts || []), contact],
      },
    });
  },

  removeEmergencyContact: (contactId) => {
    const { user } = get();

    if (!user) return;

    set({
      user: {
        ...user,
        emergencyContacts: (user.emergencyContacts || []).filter(
          (contact) => contact.id !== contactId
        ),
      },
    });
  },

  

  setToken: async (token) => {
    // Store token in SecureStore
    if (token) {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
    set({ token });
  },

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setLoading: (isLoading) => set({ isLoading }),

  refreshUser: async () => {
    const { user, setUser, setLoading } = get();

    if (!user?.id) return;

    setLoading(true);
    try {
      const refreshedUser = await userService.findOne(user.id);
      if (refreshedUser.data) {
        setUser(refreshedUser.data);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setLoading(false);
    }
  },

  resetState: async () => {
    // Clear token from SecureStore
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));