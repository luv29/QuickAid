import React, { useEffect, useState } from 'react';
import { View, Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

interface SOSFeatureProps {
  triggerThreshold?: number;
  timeWindowMs?: number;
}

export const SOSFeature: React.FC<SOSFeatureProps> = ({
  triggerThreshold = 1.8,
  timeWindowMs = 1500
}) => {
  const [subscription, setSubscription] = useState<{ remove: () => void } | null>(null);
  const [powerButtonPresses, setPowerButtonPresses] = useState(0);
  const [lastPressTime, setLastPressTime] = useState(0);
  
  // This function handles the emergency alert
  const triggerSOS = async (): Promise<void> => {
    console.log("SOS TRIGGERED!");
    
    // Vibrate the device for feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Configure notifications
    await Notifications.requestPermissionsAsync();
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    
    // Send the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Emergency SOS Activated",
        body: "A call has been made to your emergency contact.",
      },
      trigger: null, // Show immediately
    });
    
    // Here you would add your actual emergency contact calling logic
    console.log("Emergency contact would be called here");
  };

  useEffect(() => {
    // Set up accelerometer
    Accelerometer.setUpdateInterval(100); // More frequent updates for better detection
    
    // Subscribe to accelerometer data
    const _subscribe = (): void => {
      setSubscription(
        Accelerometer.addListener((accelerometerData) => {
          const { x, y, z } = accelerometerData;
          const acceleration = Math.sqrt(x * x + y * y + z * z);
          
          // Detect shake
          if (acceleration > triggerThreshold) {
            console.log("Shake detected!");
            const currentTime = new Date().getTime();
            
            // Reset counter if too much time has passed since last press
            if (currentTime - lastPressTime > timeWindowMs) {
              setPowerButtonPresses(1);
              console.log("First shake detected");
            } else {
              setPowerButtonPresses(prevPresses => {
                console.log("Shake count:", prevPresses + 1);
                return prevPresses + 1;
              });
            }
            
            setLastPressTime(currentTime);
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
    };
  }, [triggerThreshold, timeWindowMs]);

  // Check for triple shake pattern
  useEffect(() => {
    console.log("Current shake count:", powerButtonPresses);
    if (powerButtonPresses >= 3) {
      triggerSOS();
      setPowerButtonPresses(0);
    }
  }, [powerButtonPresses]);

  // This component doesn't render anything visible
  return null;
};

export default SOSFeature;