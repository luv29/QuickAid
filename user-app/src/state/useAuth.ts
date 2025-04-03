import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { ServiceType, Mechanic, Address, BankDetails } from "@quick-aid/core";
import {
  AUTH_TOKEN_KEY,
  MECHANIC_STORAGE,
} from "@/src/constants/secureStoreKeys";
import { mechanicService } from "@/src/service";

interface MechanicState {
  mechanic: Mechanic | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setMechanic: (mechanic: Mechanic) => void;
  updateMechanic: (mechanicData: Partial<Mechanic>) => void;
  updateAddress: (address: Partial<Address>) => void;
  updateServices: (services: ServiceType[]) => void;
  updateExpoToken: (token: string) => void;
  setToken: (token: string | null) => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  getMechanic: () => Mechanic | null;
  refreshMechanic: () => Promise<void>;
  resetState: () => Promise<void>;
}

export const useAuthStore = create<MechanicState>((set, get) => ({
  mechanic: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  getMechanic: () => get().mechanic,

  setMechanic: (mechanic) => set({ mechanic }),

  updateMechanic: (mechanicData) => {
    const { mechanic } = get();

    if (!mechanic) return;

    set({
      mechanic: {
        ...mechanic,
        ...mechanicData,
      },
    });
  },

  updateAddress: (address) => {
    const { mechanic } = get();

    if (!mechanic) return;

    set({
      mechanic: {
        ...mechanic,
        address: {
          address: null,
          city: null,
          pincode: null,
          lat: null,
          lng: null,
          ...(mechanic.address || {}),
          ...address,
        },
      },
    });
  },

  updateServices: (services) => {
    const { mechanic } = get();

    if (!mechanic) return;

    set({
      mechanic: {
        ...mechanic,
        services,
      },
    });
  },

  updateExpoToken: (expoToken) => {
    const { mechanic } = get();

    if (!mechanic) return;

    set({
      mechanic: {
        ...mechanic,
        expoToken,
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

  refreshMechanic: async () => {
    const { mechanic, setMechanic, setLoading } = get();

    if (!mechanic?.id) return;

    setLoading(true);
    try {
      const refreshedMechanic = await mechanicService.findOne(mechanic.id);
      if (refreshedMechanic.data) {
        setMechanic(refreshedMechanic.data);
      }
    } catch (error) {
      console.error("Failed to refresh mechanic data:", error);
    } finally {
      setLoading(false);
    }
  },

  resetState: async () => {
    // Clear token from SecureStore
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    // Clear mechanic data from AsyncStorage
    await AsyncStorage.removeItem(MECHANIC_STORAGE);

    set({
      mechanic: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
