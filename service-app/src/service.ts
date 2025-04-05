import {
  AuthService,
  MessagesService,
  MechanicService,
  BookingService,
  ServiceRequestService,
} from "@quick-aid/core";

const baseURL = process.env.EXPO_PUBLIC_API_URL!;

console.log("this is base url", baseURL);

const authService = new AuthService(baseURL!);
const mechanicService = new MechanicService(baseURL!);
const messagesService = new MessagesService(baseURL!);
const bookingService = new BookingService(baseURL!);
const serviceRequestService = new ServiceRequestService(baseURL!);

export {
  authService,
  mechanicService,
  messagesService,
  bookingService,
  serviceRequestService,
};
