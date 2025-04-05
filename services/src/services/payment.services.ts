import { AxiosInstance } from "axios";
import { api } from "../api.js";

export class PaymentService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async createOrder(amount: number, serviceRequestId: string, comment: string) {
    return await this.api.post("api/payments/create", { amount, serviceRequestId, comment });
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    return await this.api.post("api/payments/verify", { paymentId, orderId, signature });
  }
}
