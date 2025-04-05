import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

class SecureStorage {
  private isSupported: boolean;

  constructor() {
    this.isSupported = Platform.OS !== "web";
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.isSupported) return null;

    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`Retrieved value for key: ${key}`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("secure store get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.isSupported) return;
    return await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (!this.isSupported) return;
    return await SecureStore.deleteItemAsync(key);
  }
}

export const secureStore = new SecureStorage();