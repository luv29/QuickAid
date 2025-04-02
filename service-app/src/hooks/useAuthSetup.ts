import { create } from "zustand";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/libs/api";

// Define types for our auth state
interface User {
  id: string;
  name?: string;
  email?: string;
  phoneNumber: string;
  storeId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  phoneNumber: string;
  otp: string;
  token: string | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  setOtp: (otp: string) => void;
  requestOtp: () => Promise<void>;
  verifyOtp: () => Promise<boolean>;
  logout: () => Promise<void>;
  reset: () => void;

  // Store related
  fetchUserStore: () => Promise<any>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  phoneNumber: "",
  otp: "",
  token: null,

  setPhoneNumber: (phone) => set({ phoneNumber: phone }),

  setOtp: (otp) => set({ otp }),

  requestOtp: async () => {
    try {
      set({ isLoading: true });
      const { phoneNumber } = get();

      // API call to request OTP
      const response = await axios.post(`${api}/api/auth/request-otp`, {
        phoneNumber,
      });

      console.log("OTP requested for:", phoneNumber);

      // Navigate to OTP verification screen after successful request
      router.push("/");

      return response.data;
    } catch (error) {
      console.error("Error requesting OTP:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOtp: async () => {
    try {
      set({ isLoading: true });
      const { phoneNumber, otp } = get();

      // API call to verify OTP
      const response = await axios.post(`${api}/api/auth/verify-otp`, {
        phoneNumber,
        otp,
      });

      const { token, user } = response.data;

      // Save auth token to storage
      await AsyncStorage.setItem("auth_token", token);

      // Update auth state
      set({
        isAuthenticated: true,
        token,
        user,
      });

      // Navigate to home screen after successful verification
      router.replace("/(app)");

      return true;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      // Clear token from storage
      await AsyncStorage.removeItem("auth_token");

      // Reset auth state
      set({
        user: null,
        isAuthenticated: false,
        token: null,
        phoneNumber: "",
        otp: "",
      });

      // Navigate back to login
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },

  reset: () =>
    set({
      phoneNumber: "",
      otp: "",
    }),

  fetchUserStore: async () => {
    try {
      const { user, token } = get();

      if (!user || !token) {
        return null;
      }

      const url = `${api}/api/stores/search?field=phoneNumber&value=${user.phoneNumber}`;

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data.store;
    } catch (error) {
      console.error("Error fetching store:", error);
      return null;
    }
  },
}));

// Initialize auth state from storage on app start
export const initializeAuth = async () => {
  const auth = useAuth.getState();

  try {
    const token = await AsyncStorage.getItem("auth_token");

    if (token) {
      // Validate token with backend and get user data
      const response = await axios.get(`${api}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update auth store with user data
      useAuth.setState({
        isAuthenticated: true,
        token,
        user: response.data.user,
        isLoading: false,
      });
    } else {
      useAuth.setState({ isLoading: false });
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
    useAuth.setState({ isLoading: false });
  }
};
