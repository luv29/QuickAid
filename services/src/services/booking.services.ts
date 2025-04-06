import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { ServiceType, ServiceStatus } from "@prisma/client";

// Updated to match the server implementation
export interface MechanicOffer {
  id: string;
  name: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  cost: number;
  distanceText?: string;
  estimatedCost?: number;
}

// Updated to match CreateServiceRequestDto from the server
interface CreateServiceRequestDto {
  userId: string;
  serviceType: ServiceType;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  Car?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  }[];
}

interface MechanicResponseDto {
  mechanicId: string;
  serviceRequestId: string;
  isAccepted: boolean;
}

interface ConfirmBookingDto {
  serviceRequestId: string;
  mechanicId: string;
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
   * Removed userId parameter to match server implementation
   */
  async confirmBookingWithMechanic(
    serviceRequestId: string,
    mechanicId: string
  ) {
    const response = await this.api.post("api/booking/confirm", {
      serviceRequestId,
      mechanicId,
    });
    return response.data;
  }
}
