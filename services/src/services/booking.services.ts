import { ServiceType } from '@prisma/client';
import { AxiosInstance } from "axios";
import { api } from "../api.js";

// Match the interface from the controller
export interface MechanicOffer {
  mechanicId: string;
  name: string;
  rating: number;
  distance: number;
  estimatedArrivalTime: number; // in minutes
}

interface CreateServiceRequestDto {
  userId: string;
  serviceType: ServiceType;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
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
    return await this.api.post('api/booking/request', createServiceRequestDto);
  }

  /**
   * Records a mechanic's response (accept/decline) to a service request
   */
  async mechanicRespondsToRequest(
    mechanicId: string, 
    serviceRequestId: string, 
    isAccepted: boolean
  ) {
    return await this.api.post('api/booking/mechanic/response', {
      mechanicId,
      serviceRequestId,
      isAccepted
    });
  }

  /**
   * Gets available mechanics for a specific service request
   */
  async getMechanicsForServiceRequest(serviceRequestId: string) {
    return await this.api.get(`api/booking/request/${serviceRequestId}/mechanics`);
  }

  /**
   * Confirms booking with a specific mechanic
   */
  async confirmBookingWithMechanic(
    userId: string,
    serviceRequestId: string,
    mechanicId: string
  ) {
    return await this.api.post('api/booking/confirm', {
      userId,
      serviceRequestId,
      mechanicId
    });
  }
}