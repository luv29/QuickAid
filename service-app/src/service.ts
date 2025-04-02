import { AuthService } from "@quick-aid/core";

const baseURL = process.env.EXPO_PUBLIC_API_URL!;

const authService = new AuthService(baseURL);

export { authService };
