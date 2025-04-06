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
  FlatList,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import uuid from 'react-native-uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from "@/src/state/useAuth";
import { mechanicService, servicesRequestService } from "@/src/service";
import { useMechanicStore } from "@/src/state/mechnic";
import { paymentService } from "@/src/service";
import { useLocationStore } from "@/src/store";
import { router } from "expo-router";

const API_URL = 'https://4zbptm0f-8000.inc1.devtunnels.ms/';

// API call function using axios
const sendChatMessage = async ({ 
  chatId, 
  serviceRequestId, 
  userId, 
  prompt,
  userLatitude,
  userLongitude 
}) => {
  const defaultLatitude = 21.0942; // Dumas Beach latitude
  const defaultLongitude = 72.7132; // Dumas Beach longitude
  
  // Use provided coordinates if available, otherwise use Dumas Beach coordinates
  const latitude = userLatitude !== undefined ? userLatitude : defaultLatitude;
  const longitude = userLongitude !== undefined ? userLongitude : defaultLongitude;
  
  const response = await axios.post(API_URL, {
    chat_id: chatId,
    serviceRequestId,
    userId,
    prompt,
    latitude,
    longitude,
  });
  
  console.log(response.data);
  return response.data;
};

const Chatbot = ({ route }) => {
  const { userId = "67e7c19b7b2e69af772a70b3" } = route?.params || {};
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const { user } = useAuthStore();
  const { mechanic, setMechanic } = useMechanicStore();

  // Chat states
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState("");
  const [currentServiceRequestId, setCurrentServiceRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMechanicAssigned, setIsMechanicAssigned] = useState(false);

  // UI control states
  const [showServiceOptions, setShowServiceOptions] = useState(false);
  const [showServiceButtons, setShowServiceButtons] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showMechanicOffers, setShowMechanicOffers] = useState(false);
  const [mechanicOffers, setMechanicOffers] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [rating, setRating] = useState(0);

  const { userAddress, userLatitude, userLongitude } = useLocationStore();

  // Set up TanStack Query mutation
  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      handleApiResponse(data);
    },
    onError: (error) => {
      console.error("API Error:", error);
      addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", "bot");
    }
  });

  // Service options that appear on the + button press
  const getServiceOptions = () => {
    const baseOptions = [
      { id: "request", title: "Request Service" },
      { id: "sos", title: "SOS Emergency" }
    ];

    const mechanicOptions = [
      { id: "tracking", title: "Live Tracking of Mechanic", disabled: !isMechanicAssigned },
      { id: "payment", title: "Make Payment", disabled: !isMechanicAssigned },
      { id: "rating", title: "Rate Service", disabled: !isMechanicAssigned },
      { id: "reviews", title: "View My Reviews", disabled: false }
    ];

    return [...baseOptions, ...mechanicOptions];
  };

  // Available services when requesting help
  const serviceTypes = [
    { id: "TOW", title: "Towing" },
    { id: "JUMPSTART", title: "Jump Start" },
    { id: "FLAT_TIRE", title: "Flat Tyre" },
    { id: "BATTERY", title: "Dead Battery" },
    { id: "STUCK", title: "Stuck in Ditch" },
    { id: "LOCKOUT", title: "Locked Out" },
    { id: "OTHER", title: "Other" }
  ];

  // Initialize chat with welcome message and create unique chat ID
  useEffect(() => {
    // const newChatId = user?.id || uuid.v4();
    const newChatId = uuid.v4();
    setChatId(newChatId);

    const welcomeMessage = {
      id: newChatId,
      text: "Welcome to QwikAid AI! How can I help you today?",
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


  const [mechanicOffersWithRequests, setMechanicOffersWithRequests] = useState([]);

  const { data: mechanicData, isLoading: isLoadingMechanic } = useQuery({
    queryKey: ['serviceRequests', mechanicOffersWithRequests],
    queryFn: async () => {
      if (mechanicOffersWithRequests.length === 0) return null;

      let attempts = 0;
      const maxAttempts = 20;
      let foundRequest = null;

      while (!foundRequest && attempts < maxAttempts) {
        // Check each service request in the array
        for (const offer of mechanicOffersWithRequests) {
          const serviceRequestData = await servicesRequestService.findOne(offer.serviceRequestId);

          // If this request has a mechanicId assigned, we've found what we need
          if (serviceRequestData.data?.mechanicId) {
            console.log(`Found mechanicId ${serviceRequestData.data.mechanicId} in request ${offer.serviceRequestId}`);
            foundRequest = serviceRequestData.data;
            // Around line 144-149 in your code
            const mechanic = await mechanicService.findOne(foundRequest.mechanicId);
            setMechanic(mechanic.data);
            setShowMechanicOffers(false); // Add this line to hide the offers
            console.log("Mechanic data:", mechanic.data);

            // Add this code to create a mechanic message in the chat
            const mechanicMessage = {
              id: uuid.v4(),
              text: "Your mechanic has been assigned",
              sender: "bot",
              timestamp: new Date().toISOString(),
              chatId,
              mechanic1: {
                name: mechanic.data.name,
                image: mechanic.data.profileImage || "https://randomuser.me/api/portraits/men/32.jpg",
                rating: mechanic.data.rating || 4.7,
                eta: `${Math.round(mechanic.data.duration?.value / 60) || 15} mins`,
                cost: mechanic.data.cost || "500-600"
              }
            };

            setMessages(prev => [...prev, mechanicMessage]);
            break; // Exit the loop once we find a request with mechanicId
          }
        }

        if (foundRequest) break; // Exit polling if we found a request

        // Wait before trying the next batch
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
        console.log(`Polling attempt ${attempts}: checked ${mechanicOffersWithRequests.length} requests, no mechanicId found yet`);
      }

      return foundRequest;
    },
    refetchInterval: 30000, // Continue to refetch every 30 seconds
    enabled: mechanicOffersWithRequests.length > 0, // Only run if we have requests to check
    retry: false,
  });

  // Function to handle API responses based on the "from" field
  const handleApiResponse = (data) => {
    if (!data || !data.length) return;

    const responseItem = data[0];

    console.log(responseItem)

    switch (responseItem.from) {
      case "llm":
        // Handle normal text response
        addMessage(responseItem.content.text, "bot");
        break;

      case "initiateServiceRequest":
        // Handle service request response with mechanic offers
        setCurrentServiceRequestId(responseItem.content.serviceRequestId);
        const offers = responseItem.content.mechanicOffers;
        setMechanicOffers(offers);
        setShowMechanicOffers(true);

        setMechanicOffersWithRequests(
          offers.map(mechanic => ({
            mechanicId: mechanic.id,
            serviceRequestId: responseItem.content.serviceRequestId
          }))
        );



        // Add a message about available mechanics
        addMessage(`I found ${offers.length} mechanics available near you. The AI will select best for you.`, "bot");
        break;

      case "getReviewsByUser":
        // Handle reviews response
        const reviews = responseItem.content;
        let reviewMessage = "Here are your past reviews:\n\n";

        if (Object.keys(reviews).length === 0) {
          reviewMessage = "You haven't submitted any reviews yet.";
        } else {
          Object.values(reviews).forEach((review, index) => {
            const dateFormatted = new Date(review.createdAt).toLocaleDateString();
            reviewMessage += `${index + 1}. Date: ${dateFormatted}\n`;
            reviewMessage += `   Service Type: ${review.serviceRequest.serviceType}\n`;
            reviewMessage += `   Rating: ${review.rating}/5\n`;
            if (review.comment) {
              reviewMessage += `   Comment: ${review.comment}\n`;
            }
            reviewMessage += "\n";
          });
        }

        addMessage(reviewMessage, "bot");
        break;

      case "sos-emergency":
        // Handle SOS emergency response
        if (responseItem.content.action === "mail sent successfully.") {
          addMessage("Emergency alert sent successfully to " +
            responseItem.content.accepted.join(", "), "bot");
        } else {
          addMessage("Failed to send emergency alert. Please try again or call emergency services directly.", "bot");
        }
        break;

      default:
        // Handle unknown response types
        console.log("Unknown response type:", responseItem.from);
        addMessage("I received your request and am processing it.", "bot");
    }
  };

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

    const userMessage = inputText;
    addMessage(userMessage, "user");
    setInputText("");

    // Send message to API using TanStack Query
    chatMutation.mutate({
      chatId,
      serviceRequestId: currentServiceRequestId || "",
      userId,
      prompt: userMessage
    });
  };

  const handleServiceOptionSelect = (option) => {
    setShowServiceOptions(false);

    switch (option.id) {
      case "request":
        addMessage("I need to request a service", "user");
        addMessage("Please select the type of service you need:", "bot");
        setShowServiceButtons(true);
        break;

      case "tracking":
        addMessage("I want to track my mechanic", "user");

        // In a real app, this would use actual tracking data
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
        addMessage("I want to make a payment", "user");
        setShowPaymentModal(true);
        break;

      case "rating":
        addMessage("I want to rate my service", "user");
        setShowRatingModal(true);
        break;

      case "reviews":
        addMessage("Show me my past reviews", "user");

        chatMutation.mutate({
          chatId,
          serviceRequestId: currentServiceRequestId || "",
          userId,
          prompt: "Give all the reviews of the user"
        });
        break;

      case "sos":
        addMessage("I need emergency assistance!", "user");

        // Show a prompt to confirm SOS
        Alert.alert(
          "Send SOS Emergency Alert",
          "This will send an emergency alert to your emergency contacts. Continue?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Send SOS",
              onPress: () => {
                // Send SOS request to the API
                chatMutation.mutate({
                  chatId,
                  serviceRequestId: currentServiceRequestId || "",
                  userId,
                  prompt: "Emergency! Send mail to emergency@example.com fast. Critical situation."
                });
              },
              style: "destructive"
            }
          ]
        );
        break;
    }
  };

  // Handle specific service type selection
  const handleServiceTypeSelect = (service) => {
    setShowServiceButtons(false);

    if (service.id === "OTHER") {
      // For "Other", prompt user to specify
      addMessage("I need another type of service", "user");
      addMessage("Please specify what service you need:", "bot");
    } else {
      // Create service request message
      const serviceMessage = `My vehicle needs ${service.title.toLowerCase()} assistance. I am at my current location that is: latitude: ${userLatitude} and longitude:${userLongitude} and my address is ${userAddress}.`;
      addMessage(serviceMessage, "user");

      // Send service request to API
      chatMutation.mutate({
        chatId,
        serviceRequestId: "",
        userId,
        prompt: serviceMessage
      });
    }
  };

  // Handle mechanic selection from offers
  const handleMechanicSelect = (mechanic) => {
    setShowMechanicOffers(false);

    // Add selection message
    addMessage(`I'd like to select ${mechanic.name}`, "user");

    // In a real app, you would send this selection to your backend
    // For now we'll simulate the confirmation
    addMessage(`Great! ${mechanic.name} has been notified and will arrive in approximately ${mechanic.duration.text}. The estimated cost is ₹${mechanic.cost}.`, "bot");

    // Enable mechanic-related options
    setIsMechanicAssigned(true);
  };

  // Handle payment confirmation
  // Initialize the payment service with your API base URL
  const handlePaymentConfirm = async (
    amount: number,
    serviceRequestId: string,
    comment: string,
  ) => {
    // try {
    //   // Step 1: Create the order using your backend service
    //   const createOrderResponse = await paymentService.createOrder(
    //     amount,
    //     serviceRequestId,
    //     comment
    //   );

    //   const { order } = createOrderResponse.data;

    //   // Step 2: Configure the Razorpay options
    //   const options = {
    //     description: 'Payment for service',
    //     image: 'https://your-company-logo.png',
    //     currency: 'INR',
    //     key: process.env.RAZORPAY_KEY,
    //     amount: order.amount,
    //     name: 'QWICKAID',
    //     order_id: order.id,
    //     theme: { color: '#3399cc' }
    //   };

    //   // Step 3: Open Razorpay checkout
    //   const paymentData = await RazorpayCheckout.open(options);

    //   // Step 4: Verify the payment with your backend
    //   const verifyResponse = await paymentService.verifyPayment(
    //     paymentData.razorpay_payment_id,
    //     paymentData.razorpay_order_id,
    //     paymentData.razorpay_signature
    //   );

    //   // Step 5: Handle the verification response
    //   if (verifyResponse.data.success) {
    //     Alert.alert('Success', 'Your payment was successful!');
    //     // Additional success handling (e.g., navigate to success screen)
    //     return {
    //       success: true,
    //       payment: verifyResponse.data.payment
    //     };
    //   } else {
    //     Alert.alert('Payment Failed', verifyResponse.data.message || 'Payment verification failed');
    //     return {
    //       success: false,
    //       error: verifyResponse.data.message
    //     };
    //   }

    // } catch (error) {
    //   console.error('Payment process failed', error);
    //   Alert.alert(
    //     'Payment Failed',
    //     error.response?.data?.message || error.message || 'An unexpected error occurred'
    //   );
    //   return {
    //     success: false,
    //     error: error.message
    //   };
    // }
  };

  // Handle rating submission
  const handleRatingSubmit = () => {
    setShowRatingModal(false);

    // Add rating message to chat
    addMessage(`I'm giving the service ${rating} stars`, "user");

    // Bot confirmation
    addMessage(`Thank you for your ${rating}-star rating! Your feedback helps us improve our service.`, "bot");

    // In a real app, you would send this rating to your backend
  };

  // Navigate to tracking screen
  const navigateToTracking = () => {
    router.push('/(app)/route');
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
              source={{ uri: message.mechanic.image || "https://randomuser.me/api/portraits/men/32.jpg" }}
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3">
              <Text className="font-bold text-lg">{message.mechanic.name}</Text>
              <View className="flex-row items-center">
                <Text>{message.mechanic.rating || 4.7}</Text>
                <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-gray-600">ETA: {message.mechanic.eta || "15 mins"}</Text>
              <Text className="text-gray-600">Cost: ₹{message.mechanic.cost || "500-600"}</Text>
            </View>
          </View>
        </View>
      );
    }

    // Replace your existing mechanic message rendering case
    // Around line 425-445
    if (message.mechanic1) {
      return (
        <View className="bg-white rounded-lg p-4 my-2 shadow-sm self-start max-w-[90%]">
          <Text className="font-bold text-lg mb-2">Your Assigned Mechanic:</Text>
          <View className="flex-row items-center">
            <View className="ml-3">
              <Text className="font-bold text-lg">{message.mechanic.name}</Text>
              <View className="flex-row items-center">
                <Text>{message.mechanic.rating}</Text>
                <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-gray-600">ETA: {message.mechanic.eta}</Text>
              <Text className="text-gray-600">Cost: ₹{message.mechanic.cost}</Text>
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
        className={`my-2 max-w-[80%] ${message.sender === "bot" ? "self-start" : "self-end"
          }`}
      >
        <View
          className={`p-3 rounded-lg ${message.sender === "bot" ? "bg-gray-200" : "bg-blue-500"
            }`}
        >
          <Text
            className={message.sender === "bot" ? "text-black" : "text-white"}
            selectable={true}
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
          className="p-2 my-auto"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-2">QwikAid Assistance</Text>
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
            {(chatMutation.isPending || isLoading) && (
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

            {showMechanicOffers && (
              <View className="my-4">
                {mechanicOffers.map((mechanic) => (
                  <TouchableOpacity
                    key={mechanic.id}
                    className="bg-white p-4 my-2 rounded-lg shadow border border-gray-200"
                    onPress={() => handleMechanicSelect(mechanic)}
                  >
                    <Text className="font-bold text-lg">{mechanic.name}</Text>
                    <View className="flex-row justify-between mt-2">
                      <Text>Distance: {mechanic.distance.text}</Text>
                      <Text>ETA: {mechanic.duration.text}</Text>
                    </View>
                    <Text className="mt-2 text-blue-600 font-bold">Estimated Cost: ₹{mechanic.cost.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </>
        )}
      />

      {/* Input Area */}
      <View className="flex-row items-center border-t border-gray-200 pb-12 mb-16 bg-white">
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
          disabled={!inputText.trim() || chatMutation.isPending}
        >
          <Ionicons
            name="send"
            size={24}
            color={(inputText.trim() && !chatMutation.isPending) ? "#0066CC" : "#CCCCCC"}
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
          style={{ flex: 1, justifyContent: 'flex-end' }}
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
            <Text className="mb-2">Service: {currentServiceRequestId ? "Active Service" : "Sample Service"}</Text>
            <Text className="mb-2">Mechanic: {mechanicOffers.length > 0 ? mechanicOffers[0].name : "Assigned Mechanic"}</Text>
            <Text className="mb-4 text-lg font-bold">Amount: ₹{mechanicOffers.length > 0 ? mechanicOffers[0].cost.toFixed(2) : "550"}</Text>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2 mr-2"
                onPress={() => setShowPaymentModal(false)}
              >
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-lg"
                onPress={
                  () => handlePaymentConfirm(500, "67f18fa1a1a883e8a57caf3d", "pAY")}
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
            <Text className="text-xl font-bold mb-4 text-center">Rate Your Service</Text>
            <Text className="mb-4 text-center">{mechanicOffers.length > 0 ? mechanicOffers[0].name : "Recent Service"}</Text>

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

            <TextInput
              className="bg-gray-100 rounded-lg p-4 mb-4"
              placeholder="Add a comment (optional)"
              multiline={true}
              numberOfLines={3}
            />

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