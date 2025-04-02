import { AxiosInstance } from "axios";
import { api } from "../api.js";

export class MessagesService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async getOTP(phone: string) {
    const urlParams = new URLSearchParams();
    urlParams.set("phone", phone);

    return await this.api.get(`api/messages/get-otp?${urlParams.toString()}`);
  }

  async verifyOTP(phone: string, otp: string) {
    const urlParams = new URLSearchParams();
    urlParams.set("phone", phone);
    urlParams.set("otp", otp);

    return await this.api.get(
      `api/messages/verify-otp?${urlParams.toString()}`
    );
  }
}
