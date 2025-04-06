import React, { useEffect, useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Permissions from 'expo-permissions';

interface SOSFeatureProps {
  triggerThreshold?: number;
  timeWindowMs?: number;
  emergencyContacts?: string[]; // Array of emergency contact numbers
}

export const SOSFeature: React.FC<SOSFeatureProps> = ({
  triggerThreshold = 1.8,
  timeWindowMs = 1500,
  emergencyContacts = ["7350645390", "7505028822"] // Example emergency numbers
}) => {
  const [subscription, setSubscription] = useState<{ remove: () => void } | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [sosConfirmationTimer, setSosConfirmationTimer] = useState<NodeJS.Timeout | null>(null);
  const [isProcessingCall, setIsProcessingCall] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    async function requestPermissions() {
      // Request notification permissions
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    }
    
    requestPermissions();
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);
  
  // Function to make an emergency call
  const makeEmergencyCall = async () => {
    if (isProcessingCall) return; // Prevent multiple calls
    setIsProcessingCall(true);
    
    try {
      // Select a random emergency contact from the provided list
      const randomIndex = Math.floor(Math.random() * emergencyContacts.length);
      const selectedContact = emergencyContacts[randomIndex];
      
      console.log(`Calling emergency contact: ${selectedContact}`);
      
      // For Expo Go, we need to use Linking for both platforms
      // Format phone number for platform
      const phoneNumber = Platform.OS === 'ios' 
        ? `telprompt:${selectedContact}`  // iOS uses telprompt: to minimize user interaction
        : `tel:${selectedContact}`;       // Android uses tel:
      
      // Try to open the phone app with the number
      const canOpen = await Linking.canOpenURL(phoneNumber);
      
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        throw new Error("Cannot open phone app");
      }
    } catch (error) {
      console.error("Error making emergency call:", error);
      
      // Fallback for Android if direct calling fails
      if (Platform.OS === 'android') {
        try {
          // Try using intent launcher as fallback (might work in some cases)
          await IntentLauncher.startActivityAsync(
            'android.intent.action.DIAL', 
            { data: `tel:${emergencyContacts[0]}` }
          );
        } catch (intentError) {
          console.error("Intent launcher failed too:", intentError);
          // Show error alert if all methods fail
          Alert.alert(
            "Emergency Call Failed", 
            "Unable to make a call. Please manually call your emergency contact.",
            [{ text: "OK", onPress: () => setIsProcessingCall(false) }]
          );
        }
      } else {
        // Show error alert for iOS
        Alert.alert(
          "Emergency Call Failed", 
          "Unable to make a call. Please manually call your emergency contact.",
          [{ text: "OK", onPress: () => setIsProcessingCall(false) }]
        );
      }
    } finally {
      // Reset the processing state after some delay
      setTimeout(() => {
        setIsProcessingCall(false);
      }, 5000);
    }
  };
  
  // Send a local notification
  const sendLocalNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "EMERGENCY SOS ACTIVATED",
          body: "Emergency services have been contacted. Help is on the way.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  
  // This function handles the emergency alert and calls
  const triggerSOS = async (): Promise<void> => {
    console.log("SOS TRIGGERED!");
    
    // Vibrate the device for feedback - use multiple patterns for stronger feedback
    try {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 300);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 600);
      } else {
        // Android can use longer haptics
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 600);
      }
    } catch (e) {
      console.error("Haptic error:", e);
    }
    
    // Send a high-priority local notification
    await sendLocalNotification();
    
    // Make the emergency call - no further confirmation needed as timer already passed
    await makeEmergencyCall();
    
    // Show confirmation alert after call has been initiated
    Alert.alert(
      "Emergency SOS Activated",
      "A call has been made to your emergency contact.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };
  
  // This function shows the pre-notification with countdown
  const showSOSConfirmation = (): void => {
    // Vibrate to get user's attention
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // Show confirmation alert
    Alert.alert(
      "SOS Emergency Alert",
      "Are you okay? If you don't respond within 1 minute, an emergency call will be made.",
      [
        {
          text: "I'm OK - Cancel SOS",
          onPress: () => {
            console.log("SOS Cancelled by user");
            if (sosConfirmationTimer) {
              clearTimeout(sosConfirmationTimer);
              setSosConfirmationTimer(null);
            }
          },
          style: "cancel"
        }
      ],
      { cancelable: false }
    );
    
    // Set timer for 1 minute
    const timer = setTimeout(() => {
      console.log("No user response within 1 minute, triggering SOS");
      triggerSOS();
      setSosConfirmationTimer(null);
    }, 60000); // 60 seconds = 1 minute
    
    setSosConfirmationTimer(timer);
  };

  useEffect(() => {
    // Set up accelerometer with more reliable detection
    Accelerometer.setUpdateInterval(100); // More frequent updates
    
    // Subscribe to accelerometer data
    const _subscribe = (): void => {
      setSubscription(
        Accelerometer.addListener((accelerometerData) => {
          const { x, y, z } = accelerometerData;
          // Use absolute value for better shake detection
          const acceleration = Math.sqrt(x * x + y * y + z * z);
          
          // Detect shake
          if (acceleration > triggerThreshold) {
            console.log("Shake detected with acceleration:", acceleration);
            const currentTime = new Date().getTime();
            
            // Reset counter if too much time has passed since last shake
            if (currentTime - lastShakeTime > timeWindowMs) {
              setShakeCount(1);
              console.log("First shake detected");
            } else {
              setShakeCount(prevCount => {
                const newCount = prevCount + 1;
                console.log("Shake count:", newCount);
                return newCount;
              });
            }
            
            setLastShakeTime(currentTime);
          }
        })
      );
    };
    
    _subscribe();
    
    return () => {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
      
      // Clear any pending SOS confirmation timer when component unmounts
      if (sosConfirmationTimer) {
        clearTimeout(sosConfirmationTimer);
        setSosConfirmationTimer(null);
      }
    };
  }, [triggerThreshold, timeWindowMs]);

  // Check for triple shake pattern
  useEffect(() => {
    console.log("Current shake count:", shakeCount);
    if (shakeCount >= 3) {
      // Show the confirmation alert
      showSOSConfirmation();
      setShakeCount(0);
    }
  }, [shakeCount]);

  // This component doesn't render anything visible
  return null;
};

export default SOSFeature;