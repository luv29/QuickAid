import React, { useState, useEffect, useRef } from "react";
import { 
  Image, 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import uuid from 'react-native-uuid';

const Chatbot = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMechanicAssigned, setIsMechanicAssigned] = useState(false);
  
  // UI control states
  const [showServiceOptions, setShowServiceOptions] = useState(false);
  const [showServiceButtons, setShowServiceButtons] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  
  // Service options that appear on the + button press
  const getServiceOptions = () => {
    const baseOptions = [
      { id: "request", title: "Request Service" }
    ];
    
    const mechanicOptions = [
      { id: "tracking", title: "Live Tracking of Mechanic", disabled: !isMechanicAssigned },
      { id: "payment", title: "Make Payment", disabled: !isMechanicAssigned },
      { id: "rating", title: "Rate Mechanic", disabled: !isMechanicAssigned }
    ];
    
    return [...baseOptions, ...mechanicOptions];
  };
  
  // Available services when requesting help
  const serviceTypes = [
    { id: "towing", title: "Towing" },
    { id: "jumpStart", title: "Jump Start" },
    { id: "flatTyre", title: "Flat Tyre" },
    { id: "deadBattery", title: "Dead Battery" },
    { id: "stuckInDitch", title: "Stuck in Ditch" },
    { id: "lockedOut", title: "Locked Out" },
    { id: "other", title: "Other" }
  ];

  // Initialize chat with welcome message and create unique chat ID
  useEffect(() => {
    const newChatId = uuid.v4();
    setChatId(newChatId);
    
    const welcomeMessage = {
      id: uuid.v4(),
      text: "Welcome to QwikAid AI! I'm your emergency roadside assistance agent. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      chatId: newChatId
    };
    
    setMessages([welcomeMessage]);
    console.log(`Chat initialized with ID: ${newChatId}`);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Function to add a new message to the chat
  const addMessage = (text, sender) => {
    const newMessage = {
      id: uuid.v4(),
      text,
      sender,
      timestamp: new Date().toISOString(),
      chatId
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    addMessage(inputText, "user");
    setInputText("");
    simulateResponse(inputText);
  };

  const simulateResponse = (userMessage) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // Simple response logic - in a real app, this would come from your AI backend
      let responseText = "I'm processing your request. How else can I help you?";
      
      if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        responseText = "Hello! How can I assist you with roadside support today?";
      } else if (userMessage.toLowerCase().includes("help")) {
        responseText = "I'm here to help! You can request roadside assistance by clicking the '+' button and selecting 'Request Service'.";
      } else if (userMessage.toLowerCase().includes("thanks") || userMessage.toLowerCase().includes("thank you")) {
        responseText = "You're welcome! Safe travels.";
      }
      
      addMessage(responseText, "bot");
    }, 1000);
  };

  const handleServiceOptionSelect = (option) => {
    setShowServiceOptions(false);
    
    switch (option.id) {
      case "request":
        addMessage("I need to request a service", "user");
        addMessage("Please select a service to continue:", "bot");
        
        // Show service type buttons
        setShowServiceButtons(true);
        break;
        
      case "tracking":
        // Add user message for tracking
        addMessage("I want to track my mechanic", "user");
        
        // Bot response with tracking button
        const trackingResponse = {
          id: uuid.v4(),
          text: "You can track your mechanic's location in real-time",
          sender: "bot",
          timestamp: new Date().toISOString(),
          chatId,
          showTrackingButton: true
        };
        
        setMessages(prev => [...prev, trackingResponse]);
        break;
        
      case "payment":
        // Add user message for payment
        addMessage("I want to make a payment", "user");
        
        // Show payment modal
        setShowPaymentModal(true);
        break;
        
      case "rating":
        // Add user message for rating
        addMessage("I want to rate my mechanic", "user");
        setShowRatingModal(true);
        break;
    }
  };

  // Handle specific service type selection
  const handleServiceTypeSelect = (service) => {
    setShowServiceButtons(false);
    
    if (service.id === "other") {
      // For "Other", prompt user to specify
      addMessage("I need another type of service", "user");
      addMessage("Please specify what service you need:", "bot");
    } else {
      // For specific service types
      addMessage(`I need help with ${service.title}`, "user");
      
      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        addMessage("Thank you. I've detected your location as Gandhi Nagar, Vadodara. Is this correct?", "bot");
        
        // Simulate user confirming location after 2 seconds
        setTimeout(() => {
          addMessage("Yes, that's correct", "user");
          
          setIsLoading(true);
          
          // Finding mechanic message
          setTimeout(() => {
            setIsLoading(false);
            addMessage("I'm searching for available mechanics in your area...", "bot");
            
            setTimeout(() => {
              // Mechanic found message with custom format
              const mechanicMessage = {
                id: uuid.v4(),
                sender: "bot",
                timestamp: new Date().toISOString(),
                chatId,
                mechanic: {
                  name: "Rajesh Kumar",
                  rating: 4.7,
                  eta: "15 mins",
                  cost: "₹500-600",
                  distance: "2.3 km",
                  image: "https://randomuser.me/api/portraits/men/32.jpg"
                }
              };
              
              setMessages(prev => [...prev, mechanicMessage]);
              
              // Add confirmation message
              setTimeout(() => {
                addMessage("I've assigned Rajesh to help you. He'll arrive in approximately 15 minutes. Is this okay?", "bot");
                
                // Simulate user accepting
                setTimeout(() => {
                  addMessage("Yes, that works for me", "user");
                  
                  // Confirm mechanic assignment
                  addMessage("Great! Rajesh is on his way. You can now use the tracking, payment, and rating options from the + menu.", "bot");
                  
                  // Enable mechanic-related options
                  setIsMechanicAssigned(true);
                }, 1500);
              }, 1000);
            }, 2000);
          }, 1500);
        }, 2000);
      }, 1500);
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    setPaymentSuccess(true);
    
    // Add payment success message to chat
    addMessage("Payment completed successfully!", "user");
    
    // Bot confirmation
    addMessage("Thank you for your payment. The receipt has been sent to your email.", "bot");
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 3000);
  };

  // Handle rating submission
  const handleRatingSubmit = () => {
    setShowRatingModal(false);
    
    // Add rating message to chat
    addMessage(`I'm giving the mechanic ${rating} stars`, "user");
    
    // Bot confirmation
    addMessage(`Thank you for your ${rating}-star rating! Your feedback helps us improve our service.`, "bot");
  };

  // Navigate to tracking screen
  const navigateToTracking = () => {
    // In a real app, this would navigate to a tracking screen
    addMessage("Taking you to the live tracking page...", "bot");
    console.log("Navigating to tracking screen");
    // navigation.navigate('TrackingScreen');
  };

  // Render individual message component
  const renderMessage = (item) => {
    const message = item.item;
    
    // Special case for mechanic info message
    if (message.mechanic) {
      return (
        <View className="bg-white rounded-lg p-4 my-2 shadow-sm self-start max-w-[90%]">
          <View className="flex-row items-center">
            <Image 
              source={{ uri: message.mechanic.image }} 
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3">
              <Text className="font-bold text-lg">{message.mechanic.name}</Text>
              <View className="flex-row items-center">
                <Text>{message.mechanic.rating}</Text>
                <Ionicons name="star" size={14} color="#FFD700" style={{marginLeft: 4}} />
              </View>
              <Text className="text-gray-600">ETA: {message.mechanic.eta}</Text>
              <Text className="text-gray-600">Cost: {message.mechanic.cost}</Text>
            </View>
          </View>
        </View>
      );
    }
    
    // Special case for tracking button
    if (message.showTrackingButton) {
      return (
        <View className="my-2 self-start max-w-[90%]">
          <View className="bg-gray-200 rounded-lg p-4">
            <Text>{message.text}</Text>
            <TouchableOpacity 
              className="bg-blue-500 rounded-lg p-3 mt-3"
              onPress={navigateToTracking}
            >
              <Text className="text-white text-center font-bold">Track Mechanic</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // Regular text message
    return (
      <View 
        className={`my-2 max-w-[80%] ${
          message.sender === "bot" ? "self-start" : "self-end"
        }`}
      >
        <View 
          className={`p-3 rounded-lg ${
            message.sender === "bot" ? "bg-gray-200" : "bg-blue-500"
          }`}
        >
          <Text 
            className={message.sender === "bot" ? "text-black" : "text-white"}
          >
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-2">Roadside Assistance</Text>
      </View>
      
      {/* Chat Messages */}
      <FlatList
        ref={scrollViewRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <>
            {isLoading && (
              <View className="self-center my-4">
                <ActivityIndicator size="small" color="#0066CC" />
              </View>
            )}
            
            {showServiceButtons && (
              <View className="flex-row flex-wrap justify-center my-4">
                {serviceTypes.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    className="bg-gray-200 m-1 px-4 py-2 rounded-full"
                    onPress={() => handleServiceTypeSelect(service)}
                  >
                    <Text>{service.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      />
      
      {/* Input Area */}
      <View className="flex-row items-center border-t border-gray-200 mb-16 p-2 bg-white">
        <TouchableOpacity 
          className="p-2 mr-2"
          onPress={() => setShowServiceOptions(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#0066CC" />
        </TouchableOpacity>
        
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2"
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
        />
        
        <TouchableOpacity 
          className="p-2 ml-2" 
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={inputText.trim() ? "#0066CC" : "#CCCCCC"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Service Options Modal */}
      <Modal
        transparent={true}
        visible={showServiceOptions}
        animationType="slide"
        onRequestClose={() => setShowServiceOptions(false)}
      >
        <TouchableOpacity 
          style={{flex: 1, justifyContent: 'flex-end'}}
          activeOpacity={1}
          onPress={() => setShowServiceOptions(false)}
        >
          <View className="bg-white rounded-t-xl p-4">
            <Text className="text-lg font-bold mb-4">Select an option</Text>
            {getServiceOptions().map((option) => (
              <TouchableOpacity
                key={option.id}
                className={`py-3 border-b border-gray-200 ${option.disabled ? 'opacity-50' : ''}`}
                onPress={() => !option.disabled && handleServiceOptionSelect(option)}
                disabled={option.disabled}
              >
                <Text className={`text-base ${option.disabled ? 'text-gray-400' : 'text-black'}`}>
                  {option.title}
                </Text>
                {option.disabled && (
                  <Text className="text-xs text-gray-400">
                    (Available after mechanic assignment)
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="py-3 mt-2"
              onPress={() => setShowServiceOptions(false)}
            >
              <Text className="text-base text-center text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        transparent={true}
        visible={showPaymentModal}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-5 w-4/5">
            <Text className="text-xl font-bold mb-4 text-center">Payment Details</Text>
            <Text className="mb-2">Service: Flat Tyre Repair</Text>
            <Text className="mb-2">Mechanic: Rajesh Kumar</Text>
            <Text className="mb-4 text-lg font-bold">Amount: ₹550</Text>
            
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2 mr-2"
                onPress={() => setShowPaymentModal(false)}
              >
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-lg"
                onPress={handlePaymentConfirm}
              >
                <Text className="text-white font-bold">Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Rating Modal */}
      <Modal
        transparent={true}
        visible={showRatingModal}
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-5 w-4/5">
            <Text className="text-xl font-bold mb-4 text-center">Rate Your Mechanic</Text>
            <Text className="mb-4 text-center">Rajesh Kumar</Text>
            
            <View className="flex-row justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Ionicons 
                    name={rating >= star ? "star" : "star-outline"} 
                    size={36} 
                    color={rating >= star ? "#FFD700" : "#CCCCCC"}
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 mr-2"
                onPress={() => setShowRatingModal(false)}
              >
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={handleRatingSubmit}
                disabled={rating === 0}
              >
                <Text className="text-white font-bold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Payment Success Modal */}
      {paymentSuccess && (
        <View className="absolute inset-0 flex justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 items-center">
            <Ionicons name="checkmark-circle" size={64} color="green" />
            <Text className="text-xl font-bold mt-3">Payment Successful!</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Chatbot;