import { AxiosInstance } from "axios";
import { api } from "../api.js";

export class SosService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async createSOS(sosInput: {
    userId: string;
    latitude: number;
    longitude: number;
    customMessage?: string;
    emergencyContact: {
      id?: string;
      name: string;
      mobileNumber: string;
      email?: string;
    };
  }) {
    return await this.api.post("api/sos", sosInput);
  }
}
