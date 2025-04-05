import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const SOSFeatureTest: React.FC = () => {
  const [presses, setPresses] = useState<number>(0);
  const [lastPressTime, setLastPressTime] = useState<number>(0);
  
  const handlePress = (): void => {
    const currentTime = new Date().getTime();
    
    // Reset counter if too much time has passed
    if (currentTime - lastPressTime > 1500) {
      setPresses(1);
    } else {
      setPresses(prevPresses => {
        const newCount = prevPresses + 1;
        if (newCount >= 3) {
          triggerSOS();
          return 0;
        }
        return newCount;
      });
    }
    
    setLastPressTime(currentTime);
  };
  
  const triggerSOS = (): void => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Emergency SOS Activated",
      "A call has been made to your emergency contact.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Press 3 times quickly to simulate SOS" 
        onPress={handlePress} 
      />
      <Text style={styles.counter}>
        Press count: {presses}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  counter: {
    marginTop: 10,
  }
});

export default SOSFeatureTest;