import React, { useEffect, useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Device from 'expo-device';

interface SOSFeatureProps {
  triggerThreshold?: number;
  timeWindowMs?: number;
  emergencyContacts?: string[]; // Array of emergency contact numbers
}

export const SOSFeature: React.FC<SOSFeatureProps> = ({
  triggerThreshold = 1.8,
  timeWindowMs = 1500,
  emergencyContacts = ["7490811091", "7505028822"] // Example emergency numbers
}) => {
  const [subscription, setSubscription] = useState<{ remove: () => void } | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [sosConfirmationTimer, setSosConfirmationTimer] = useState<NodeJS.Timeout | null>(null);
  const [isProcessingCall, setIsProcessingCall] = useState(false);
  const [notificationsPermitted, setNotificationsPermitted] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    async function requestPermissions() {
      // Check for device type
      const isDevice = await Device.isDeviceAsync();
      if (!isDevice) {
        console.log('Must use a physical device for Push Notifications');
        return;
      }

      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('Requesting notification permission...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions!');
        return;
      }

      console.log('Notification permissions granted!');
      setNotificationsPermitted(true);
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
          // Try using intent launcher as fallback
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
    if (!notificationsPermitted) {
      console.log("Notification permissions not granted, cannot send notification");
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "EMERGENCY SOS ACTIVATED",
          body: "Emergency services have been contacted. Help is on the way.",
          sound: true, // Make sure sound is enabled
          priority: 'max', // Set maximum priority
          // Add these for Android to ensure notification appears
          android: {
            priority: 'max',
            sticky: true,
            channelId: 'emergency-sos',
          },
        },
        trigger: null, // Send immediately
      });

      console.log("Notification scheduled with ID:", notificationId);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Create notification channel for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('emergency-sos', {
        name: 'Emergency SOS Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
        sound: true,
      });
      console.log("Created emergency notification channel for Android");
    }
  }, []);

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

    // Send notification first
    await sendLocalNotification();

    // Show confirmation alert before call
    setTimeout(() => {
      Alert.alert(
        "Emergency SOS Activated",
        "A call will be made to your emergency contact.",
        [{ text: "OK", onPress: () => makeEmergencyCall() }],
        { cancelable: false }
      );
    }, 300);
  };

  // New initial alert that shows "Emergency alert has been issued. Tap to dismiss."
  const showInitialAlert = (): void => {
    // Vibrate to get user's attention
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      console.error("Haptic error:", e);
    }

    // Show the initial alert that user can dismiss
    setTimeout(() => {
      Alert.alert(
        "Emergency Alert",
        "An emergency alert has been issued. Tap to dismiss.",
        [
          {
            text: "Dismiss",
            onPress: () => {
              console.log("Initial alert dismissed by user");
              if (sosConfirmationTimer) {
                clearTimeout(sosConfirmationTimer);
                setSosConfirmationTimer(null);
              }
            },
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
    }, 300);

    // If user doesn't respond within 1 minute, proceed with SOS confirmation
    const timer = setTimeout(() => {
      console.log("No user response to initial alert within 1 minute, showing SOS confirmation");
      showSOSConfirmation();
      setSosConfirmationTimer(null);
    }, 60000); // 60 seconds = 1 minute

    setSosConfirmationTimer(timer);
  };

  // This function shows the secondary confirmation
  const showSOSConfirmation = (): void => {
    // Vibrate again to get user's attention
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      console.error("Haptic error:", e);
    }

    setTimeout(() => {
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
    }, 300);

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
      console.log("Triple shake detected, showing initial alert");
      // Show the initial dismissible alert first
      showInitialAlert();
      setShakeCount(0);
    }
  }, [shakeCount]);

  // This component doesn't render anything visible
  return null;
};

export default SOSFeature;