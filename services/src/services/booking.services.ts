import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { ServiceType } from "@prisma/client";

// Match the interface from the controller
export interface MechanicOffer {
  mechanicId: string;
  name: string;
  rating: number;
  distance: number;
  estimatedArrivalTime: number; // in minutes
}

interface Car {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface CreateServiceRequestDto {
  userId: string;
  serviceType: ServiceType;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  Car?: Car[]; // Added to match the controller definition
}

interface MechanicResponseDto {
  serviceRequestId: string;
  isAccepted: boolean;
  mechanicId: string;
}

interface ConfirmBookingDto {
  serviceRequestId: string;
  mechanicId: string;
  userId: string;
}

export class BookingService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  /**
   * Creates a new service request and finds available mechanics
   */
  async initiateServiceRequest(
    createServiceRequestDto: CreateServiceRequestDto
  ): Promise<{ serviceRequestId: string; mechanicOffers: MechanicOffer[] }> {
    const response = await this.api.post(
      "api/booking/request",
      createServiceRequestDto
    );
    return response.data;
  }

  /**
   * Records a mechanic's response (accept/decline) to a service request
   */
  async mechanicRespondsToRequest(
    mechanicId: string,
    serviceRequestId: string,
    isAccepted: boolean
  ) {
    const response = await this.api.post("api/booking/mechanic/response", {
      mechanicId,
      serviceRequestId,
      isAccepted,
    });
    return response.data;
  }

  /**
   * Gets available mechanics for a specific service request
   */
  async getMechanicsForServiceRequest(serviceRequestId: string) {
    const response = await this.api.get(
      `api/booking/request/${serviceRequestId}/mechanics`
    );
    return response.data;
  }

  /**
   * Confirms booking with a specific mechanic
   */
  async confirmBookingWithMechanic(
    userId: string,
    serviceRequestId: string,
    mechanicId: string
  ) {
    const response = await this.api.post("api/booking/confirm", {
      userId,
      serviceRequestId,
      mechanicId,
    });
    return response.data;
  }
}
