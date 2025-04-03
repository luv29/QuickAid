import { AuthService, MessagesService, UserService } from "@quick-aid/core";

const baseURL = process.env.EXPO_PUBLIC_API_URL!;

console.log("this is base url", baseURL);

const authService = new AuthService(baseURL!);
const userService = new UserService(baseURL!);
const messagesService = new MessagesService(baseURL!);

export { authService, userService, messagesService };
