import React, { useState, useEffect, useRef } from "react";
import { 
  Image, 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "@/src/store";

const Chatbot = () => {
  const navigation = useNavigation();
  const { selectedService, setSelectedService } = useLocationStore();
  const scrollViewRef = useRef();
  
  // States
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  
  // Sample mechanics data
  const mechanics = [
    {
      id: 1,
      name: "Rajesh Kumar",
      rating: 4.7,
      estimatedTime: "15 mins",
      cost: "₹500-600",
      location: "Gandhi Nagar, Vadodara",
      distance: "2.3 km",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Suresh Patel",
      rating: 4.5,
      estimatedTime: "20 mins",
      cost: "₹450-550",
      location: "Alkapuri, Vadodara",
      distance: "3.5 km",
      image: "https://randomuser.me/api/portraits/men/44.jpg"
    }
  ];
  
  // Service options
  const serviceOptions = [
    "Flat Tyre",
    "Stuck in Ditch",
    "Jump Start",
    "Locked Out",
    "Accident Towing",
    "Other"
  ];

  // Initialize chat with welcome message
  useEffect(() => {
    const initialMessage = {
      id: 1,
      text: "Hello! I am QwikAid Bot. Please select the issue you are facing.",
      sender: "bot",
      type: "text"
    };
    
    setMessages([initialMessage]);
    
    // If a service is already selected, simulate user selecting it
    if (selectedService) {
      setTimeout(() => {
        handleServiceSelect(selectedService);
      }, 500);
    }
  }, []);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, isLoading]);

  // Handle service selection
  const handleServiceSelect = (service) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: service,
      sender: "user",
      type: "text"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSelectedService(service);
    setCurrentStep(1);
    
    // Add bot response after a short delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "Location Accessed. Could you please share vehicle details?",
        sender: "bot",
        type: "text"
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 700);
  };

  // Handle vehicle details submission
  const handleVehicleDetails = () => {
    // Simulate user entering vehicle details
    const userVehicleMessage = {
      id: Date.now(),
      text: "Maruti Swift Dzire, bought in 2019",
      sender: "user",
      type: "text"
    };
    
    setMessages(prev => [...prev, userVehicleMessage]);
    setCurrentStep(2);
    setIsLoading(true);
    
    // Simulate finding mechanics nearby
    setTimeout(() => {
      const searchingMessage = {
        id: Date.now() + 1,
        text: "Fetching Mechanics near Gandhi Nagar, Vadodara...",
        sender: "bot",
        type: "text"
      };
      
      setMessages(prev => [...prev, searchingMessage]);
      
      // Show mechanic after a delay
      setTimeout(() => {
        setIsLoading(false);
        const mechanic = mechanics[0];
        setSelectedMechanic(mechanic);
        
        const mechanicMessage = {
          id: Date.now() + 2,
          mechanic: mechanic,
          sender: "bot",
          type: "mechanic"
        };
        
        setMessages(prev => [...prev, mechanicMessage]);
        setCurrentStep(3);
      }, 2000);
    }, 1000);
  };

  // Handle mechanic selection
  const handleMechanicResponse = (accepted) => {
    if (accepted) {
      const userAcceptMessage = {
        id: Date.now(),
        text: "Accepted!",
        sender: "user",
        type: "text"
      };
      
      const botConfirmMessage = {
        id: Date.now() + 1,
        text: `Good choice! ${selectedMechanic.name} is on his way. Track his arrival?`,
        sender: "bot",
        type: "text"
      };
      
      setMessages(prev => [...prev, userAcceptMessage, botConfirmMessage]);
      setIsAccepted(true);
      setCurrentStep(4);
    } else {
      // Request another mechanic
      const userRejectMessage = {
        id: Date.now(),
        text: "Request another",
        sender: "user",
        type: "text"
      };
      
      setMessages(prev => [...prev, userRejectMessage]);
      setIsLoading(true);
      
      // Show another mechanic after delay
      setTimeout(() => {
        setIsLoading(false);
        const mechanic = mechanics[1];
        setSelectedMechanic(mechanic);
        
        const newMechanicMessage = {
          id: Date.now() + 1,
          mechanic: mechanic,
          sender: "bot",
          type: "mechanic"
        };
        
        setMessages(prev => [...prev, newMechanicMessage]);
      }, 1500);
    }
  };

  // Track mechanic handler
  const handleTrackMechanic = () => {
    const userTrackMessage = {
      id: Date.now(),
      text: "Live Tracking",
      sender: "user",
      type: "text"
    };
    
    const botTrackMessage = {
      id: Date.now() + 1,
      text: `Tracking ${selectedMechanic.name}. Estimated arrival in ${selectedMechanic.estimatedTime}.`,
      sender: "bot",
      type: "text"
    };
    
    setMessages(prev => [...prev, userTrackMessage, botTrackMessage]);
    
    // Navigate to tracking screen (would implement in a real app)
    // navigation.navigate('TrackingScreen');
  };

  // Render message based on type
  const renderMessage = (message) => {
    switch (message.type) {
      case "text":
        return (
          <View 
            key={message.id}
            className={`rounded-2xl p-3 my-1 max-w-[80%] ${
              message.sender === "bot" 
                ? "bg-gray-200 self-start" 
                : "bg-blue-100 self-end"
            }`}
          >
            <Text className="text-gray-800">{message.text}</Text>
          </View>
        );
      
      case "mechanic":
        return (
          <View key={message.id} className="self-start my-2 w-full">
            <View className="bg-gray-200 p-4 rounded-xl">
              <View className="flex-row items-center">
                <Image 
                  source={{ uri: message.mechanic.image }} 
                  className="w-10 h-10 rounded-full bg-gray-300"
                />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-JakartaBold text-lg">{message.mechanic.name}</Text>
                    <View className="flex-row items-center">
                      <Text className="mr-1">{message.mechanic.rating}</Text>
                      <Ionicons name="star" size={16} color="#FFD700" />
                    </View>
                  </View>
                  <Text className="text-gray-600">
                    Estimated time to arrive: {message.mechanic.estimatedTime}
                  </Text>
                  <Text className="text-gray-600">
                    Cost for service and repair: {message.mechanic.cost}
                  </Text>
                </View>
              </View>
              
              {currentStep === 3 && !isAccepted && (
                <View className="flex-row justify-center mt-4 space-x-3">
                  <TouchableOpacity 
                    className="bg-gray-300 px-4 py-2 rounded-full" 
                    onPress={() => handleMechanicResponse(true)}
                  >
                    <Text className="font-JakartaBold">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="bg-gray-300 px-4 py-2 rounded-full"
                    onPress={() => handleMechanicResponse(false)}
                  >
                    <Text className="font-JakartaBold">Request another</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  // Debugging - print message count
  console.log(`Current messages count: ${messages.length}`);
  console.log(`Current step: ${currentStep}`);

  // Render service selection buttons
  const renderServiceButtons = () => {
    if (currentStep !== 0 || selectedService) return null;
    
    return (
      <View className="flex-row flex-wrap justify-center mt-4 mb-6">
        {serviceOptions.map((service, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-300 m-1 px-4 py-2 rounded-full"
            onPress={() => handleServiceSelect(service)}
          >
            <Text>{service}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render vehicle input when appropriate
  const renderVehicleInput = () => {
    if (currentStep !== 1) return null;
    
    return (
      <TouchableOpacity
        className="bg-blue-100 p-3 my-4 rounded-2xl self-end"
        onPress={handleVehicleDetails}
      >
        <Text>Maruti Swift Dzire, bought in 2019</Text>
      </TouchableOpacity>
    );
  };

  // Render tracking button when appropriate
  const renderTrackingButton = () => {
    if (currentStep !== 4) return null;
    
    return (
      <TouchableOpacity 
        className="bg-gray-200 flex-row items-center justify-between px-4 py-3 rounded-lg mt-3"
        onPress={handleTrackMechanic}
      >
        <Text className="font-JakartaBold">Live Tracking</Text>
        <Ionicons name="chevron-forward" size={20} color="#000" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => navigation.navigate('/(root)/(tabs)/home')}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-JakartaBold">QwikAid Bot</Text>
      </View>
      
      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(message => renderMessage(message))}
        
        {isLoading && (
          <View className="self-center my-4">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        
        {renderServiceButtons()}
        {renderVehicleInput()}
        {renderTrackingButton()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chatbot;