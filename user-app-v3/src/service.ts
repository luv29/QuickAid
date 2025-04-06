import {
  AuthService,
  MessagesService,
  UserService,
  MechanicDiscoveryService,
  ServiceRequestService,
  PaymentService,
  MechanicService
} from "@quick-aid/core";

const baseURL = process.env.EXPO_PUBLIC_API_URL!;

console.log("this is base url", baseURL);

const authService = new AuthService(baseURL!);
const userService = new UserService(baseURL!);
const messagesService = new MessagesService(baseURL!);
const mechanicDiscoveryService = new MechanicDiscoveryService(baseURL!);
const servicesRequestService = new ServiceRequestService(baseURL!);
const paymentService = new PaymentService(baseURL!);
const mechanicService = new MechanicService(baseURL!);

export {
  authService,
  userService,
  messagesService,
  mechanicDiscoveryService,
  servicesRequestService,
  paymentService,
  mechanicService
};
