// backgroundTasks.ts - Simplified version for Expo Go
import { Accelerometer } from 'expo-sensors';
import * as Notifications from 'expo-notifications';

let accelerometerSubscription: { remove: () => void } | null = null;

// Function to trigger emergency notification
const triggerSOSNotification = async (): Promise<void> => {
  // Configure notifications first
  await Notifications.requestPermissionsAsync();
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Emergency SOS Activated",
      body: "A call has been made to your emergency contact.",
    },
    trigger: null, // Show immediately
  });
};

// Register shake detection
export const registerBackgroundTask = async (): Promise<boolean> => {
  try {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }

    // Set update interval for the accelerometer
    await Accelerometer.setUpdateInterval(100);
    
    // Start listening to accelerometer data
    accelerometerSubscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      
      // If strong shake detected, trigger notification
      if (acceleration > 1.8) {
        console.log("Strong shake detected in background task:", acceleration);
        triggerSOSNotification();
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to register shake detection:', error);
    return false;
  }
};

// Unregister shake detection
export const unregisterBackgroundTask = async (): Promise<boolean> => {
  try {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      accelerometerSubscription = null;
      return true;
    }
    console.log('Task not registered, nothing to unregister');
    return true;
  } catch (error) {
    console.error('Failed to unregister shake detection:', error);
    return false;
  }
};