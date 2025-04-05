import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, Linking, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { icons } from '@/src/constants';
import { useLocationStore } from '@/src/store';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetworkStatus } from '@/src/hooks/useNetworkinfostatus';
import { useOfflineMechanics } from '@/src/hooks/useOfflineMechanics'; // Import the new hook

interface Mechanic {
  id: string;
  name: string;
  phoneNumber: string;
  distance: number;
  // Using a placeholder image since the actual mechanic data doesn't include photos
  photo?: any;
  rating?: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

// Dummy data for emergency contacts
const emergencyContacts: EmergencyContact[] = [
  { id: '1', name: 'Roadside Assistance', phone: '+18001234567' },
  { id: '2', name: 'Police', phone: '911' },
  { id: '3', name: 'Towing Service', phone: '+18009876543' },
  { id: '4', name: 'Insurance Helpline', phone: '+18001122334' },
  { id: '5', name: 'Car Rental', phone: '+18005544332' },
];

interface TroubleshootingGuide {
  id: string;
  title: string;
  description: string;
  image: any;
  htmlContent: string;
}

const troubleshootingGuides: TroubleshootingGuide[] = [
  {
    id: '1',
    title: 'How to Fix a Flat Tire',
    description: 'Step-by-step guide to change your tire safely',
    image: require('@/assets/images/Engine.jpg'), // Replace with your image path
    htmlContent: '<h1>Fixing a Flat Tire</h1><p>Step 1: Find a safe location...</p>'
  },
  {
    id: '2',
    title: 'Jump Start a Dead Battery',
    description: 'Quick guide to jump-start your car battery',
    image: require('@/assets/images/Flattyre.jpg'), // Replace with your image path
    htmlContent: '<h1>Jump Starting Your Car</h1><p>Step 1: Position the cars...</p>'
  },
  {
    id: '3',
    title: 'Engine Overheating Solutions',
    description: 'What to do when your engine overheats',
    image: require('@/assets/images/fuel.jpg'), // Replace with your image path
    htmlContent: '<h1>Engine Overheating</h1><p>Step 1: Turn off the AC...</p>'
  },
  {
    id: '4',
    title: 'Dealing with a Frozen Lock',
    description: 'How to thaw your car lock in cold weather',
    image: require('@/assets/images/idk1.jpg'), // Replace with your image path
    htmlContent: '<h1>Frozen Car Locks</h1><p>Step 1: Use a hand sanitizer...</p>'
  },
  {
    id: '5',
    title: 'Emergency Brake Failure',
    description: 'What to do if your brakes fail while driving',
    image: require('@/assets/images/idk2.jpg'), // Replace with your image path
    htmlContent: '<h1>Brake Failure</h1><p>Step 1: Dont panic...</p>'
  },
];

// Sample mechanic photos to match with real data
const mechanicPhotos = [
  require('@/assets/images/Engine.jpg'),
  require('@/assets/images/Towing.jpg'),
  require('@/assets/images/fuel.jpg'),
  require('@/assets/images/idk1.jpg'),
  require('@/assets/images/idk2.jpg'),
];

const OfflinePage = () => {
  // Use the network context instead of local state
  const { isConnected, setNetworkStatus } = useNetworkStatus();
  const [selectedGuide, setSelectedGuide] = useState<TroubleshootingGuide | null>(null);
  const { userAddress } = useLocationStore();

  // Use our offline mechanics hook to get cached mechanic data
  const { data: mechanics, isLoading, isError, isOffline, forceFetch } = useOfflineMechanics();

  // Set local display state based on the global network state
  const [isOnline, setIsOnline] = useState(isConnected);

  // Update local state whenever network status changes
  useEffect(() => {
    setIsOnline(isConnected);
  }, [isConnected]);

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    setNetworkStatus(newStatus); // Update the global network status

    if (newStatus) {
      // Try to fetch new data when toggling online
      forceFetch();
      // Navigate back to home tab when toggled to online
      router.replace('/(app)/(tabs)/home');
    }
  };

  // Check if network status changes externally
  useEffect(() => {
    if (isConnected) {
      router.replace('/(app)/(tabs)/home');
    }
  }, [isConnected]);

  const handleCall = (phoneNumber: string) => {
    let formattedNumber = phoneNumber;
    if (Platform.OS === 'android') {
      formattedNumber = `tel:${phoneNumber}`;
    } else {
      formattedNumber = `telprompt:${phoneNumber}`;
    }

    Linking.canOpenURL(formattedNumber)
      .then(supported => {
        if (supported) {
          Linking.openURL(formattedNumber);
        } else {
          console.log("Phone call not supported");
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  const renderMechanicCard = ({ item, index }: { item: Mechanic, index: number }) => {
    // Use a photo from our array based on index, cycling through available photos
    const photoIndex = index % mechanicPhotos.length;
    const photo = mechanicPhotos[photoIndex];

    // Default rating if not present in the data
    const rating = item.rating || (4.5 + (index % 5) / 10);

    return (
      <View className="w-64 mr-4 h-44 bg-white rounded-xl shadow-xs relative">
        <View className="p-4 flex flex-col h-full">
          <View className="flex-row items-center">
            <Image
              source={photo}
              className="w-16 h-16 rounded-full bg-gray-200"
            />
            <View className="ml-3 flex-1">
              <Text className="text-lg font-JakartaBold">{item.name}</Text>
              <View className="flex-row items-center">
                <Image source={icons.star} className="w-4 h-4 mr-1" />
                <Text className="text-sm font-JakartaMedium">{rating.toFixed(1)}</Text>
              </View>
              <Text className="text-sm text-gray-500 font-JakartaRegular">
                {item.distance.toFixed(1)} km away
              </Text>
            </View>
          </View>
          <View className="flex-1" /> {/* Spacer to push button to bottom */}
          <TouchableOpacity
            onPress={() => handleCall(item.phoneNumber)}
            className="mt-2 bg-general-400 rounded-full py-2 items-center flex-row justify-center absolute bottom-4 left-4 right-4"
          >
            <Image source={icons.target} className="w-6 h-6 mr-2" tintColor="white" />
            <Text className="text-white font-JakartaMedium">Call Mechanic</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmergencyContact = ({ item }: { item: EmergencyContact }) => (
    <TouchableOpacity
      onPress={() => handleCall(item.phone)}
      className="mr-3 bg-red-500 px-4 py-2 rounded-full flex-row items-center"
    >
      <Image source={icons.target} className="w-6 h-6 mr-2" tintColor="white" />
      <Text className="text-white font-JakartaMedium">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTroubleshootingCard = ({ item }: { item: TroubleshootingGuide }) => (
    <TouchableOpacity
      onPress={() => setSelectedGuide(item)}
      className="flex-row bg-white rounded-xl mb-3 overflow-hidden shadow-sm"
    >
      <Image
        source={item.image}
        className="w-24 h-24 bg-gray-200"
        resizeMode="cover"
      />
      <View className="p-3 flex-1 justify-center">
        <Text className="text-lg font-JakartaBold">{item.title}</Text>
        <Text className="text-sm text-gray-500 font-JakartaRegular">{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (selectedGuide) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setSelectedGuide(null)} className="mr-3">
              <Image source={icons.backArrow} className="w-6 h-6" />
            </TouchableOpacity>
            <Text className="text-xl font-JakartaBold">{selectedGuide.title}</Text>
          </View>
        </View>
        <ScrollView className="flex-1 p-4">
          {/* This would normally use a WebView component to render HTML, but for offline use we're hardcoding the content */}
          <Image
            source={selectedGuide.image}
            className="w-full h-48 rounded-lg mb-4"
            resizeMode="cover"
          />
          <Text className="text-base leading-6 font-JakartaRegular">
            {/* Simple text representation of what would be HTML content */}
            {selectedGuide.title === 'How to Fix a Flat Tire' ? (
              "Step 1: Find a safe location away from traffic.\n\nStep 2: Apply the parking brake and place wheel wedges.\n\nStep 3: Remove the hubcap and loosen the lug nuts.\n\nStep 4: Place the jack under the vehicle at the designated jack point.\n\nStep 5: Raise the vehicle until the flat tire is about 6 inches off the ground.\n\nStep 6: Remove the lug nuts and the flat tire.\n\nStep 7: Mount the spare tire and hand-tighten the lug nuts.\n\nStep 8: Lower the vehicle and fully tighten the lug nuts in a star pattern.\n\nStep 9: Replace the hubcap if applicable."
            ) : selectedGuide.title === 'Jump Start a Dead Battery' ? (
              "Step 1: Position the working vehicle close to the dead battery vehicle, but ensure they don't touch.\n\nStep 2: Turn off both vehicles and remove keys from ignition.\n\nStep 3: Open the hoods of both vehicles.\n\nStep 4: Identify the positive (+) and negative (-) terminals on both batteries.\n\nStep 5: Connect the red jumper cable to the positive terminal of the dead battery.\n\nStep 6: Connect the other end of the red cable to the positive terminal of the good battery.\n\nStep 7: Connect the black jumper cable to the negative terminal of the good battery.\n\nStep 8: Connect the other end of the black cable to an unpainted metal surface on the engine of the car with the dead battery.\n\nStep 9: Start the working vehicle and let it run for a few minutes.\n\nStep 10: Try to start the vehicle with the dead battery.\n\nStep 11: Once started, remove the cables in the reverse order they were attached."
            ) : (
              "Detailed instructions for this guide would appear here in the actual application."
            )}
          </Text>
          {/* Add some bottom padding */}
          <View className="h-12" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-nuetral-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with toggle */}
        <View className="flex-row items-center justify-between p-4">
          <Text className="text-2xl font-JakartaExtraBold">
            You are now offline
          </Text>
          <View className="flex-row items-center">
            <Text className="mr-2 font-JakartaMedium text-sm">
              {isOnline ? "Online" : "Offline"}
            </Text>
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`w-14 h-7 rounded-full flex justify-center px-1 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <View className={`w-5 h-5 bg-white rounded-full ${isOnline ? 'ml-auto' : 'mr-auto'}`} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Last known location */}
        <View className="bg-white p-4 mt-2 w-[95%] mx-auto flex-row items-center">
          <Image source={icons.point} className="w-8 h-8 mr-1" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500 font-JakartaRegular">Last known location</Text>
            <Text className="text-base font-JakartaMedium">
              {userAddress || "No location data available"}
            </Text>
          </View>
        </View>

        {/* Nearby mechanics section - now using real mechanic data */}
        <View className="mt-1 p-4">
          <Text className="text-xl font-JakartaBold mb-3">Nearby Mechanics</Text>
          {isLoading ? (
            <View className="h-32 justify-center items-center">
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : isError ? (
            <View className="h-32 justify-center items-center">
              <Text className="text-red-500 font-JakartaMedium">Could not load mechanics data</Text>
            </View>
          ) : mechanics && mechanics.length > 0 ? (
            <FlatList
              data={mechanics}
              renderItem={({ item, index }) => renderMechanicCard({ item, index })}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          ) : (
            <View className="h-32 justify-center items-center">
              <Text className="text-gray-500 font-JakartaMedium">No mechanics data available</Text>
            </View>
          )}
          {isOffline && (
            <Text className="text-sm italic text-gray-500 mt-1 font-JakartaRegular">
              Using cached mechanics data
            </Text>
          )}
        </View>

        {/* Emergency contacts section */}
        <View className="px-4 py-1">
          <Text className="text-xl font-JakartaBold mb-3">Emergency Contacts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {emergencyContacts.map(contact => (
              <View key={contact.id}>{renderEmergencyContact({ item: contact })}</View>
            ))}
          </ScrollView>
        </View>

        {/* Troubleshooting guides */}
        <View className="mt-1 p-4">
          <Text className="text-xl font-JakartaBold mb-3">Basic Troubleshooting</Text>
          {troubleshootingGuides.map(guide => (
            <View key={guide.id}>{renderTroubleshootingCard({ item: guide })}</View>
          ))}
        </View>

        {/* Bottom padding */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OfflinePage;