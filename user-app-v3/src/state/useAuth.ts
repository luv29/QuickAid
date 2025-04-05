import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { User } from "@quick-aid/core";
import { AUTH_TOKEN_KEY } from "@/src/constants/secureStoreKeys";
import { userService } from "@/src/service";

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Core functions
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  setToken: (token: string | null) => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;

  // Utility functions
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
