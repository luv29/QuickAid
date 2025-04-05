import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { AuthorizerType } from "../index.js";

export class AuthService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async createToken(
    phone: string,
    authorizerType?: AuthorizerType,
    expiresIn?: string
  ) {
    return await this.api.post(`api/auth/create-token`, {
      phone,
      authorizerType,
      expiresIn,
    });
  }

  async verifyToken(token: string) {
    return await this.api.post(`api/auth/verify-token`, { token });
  }
}
