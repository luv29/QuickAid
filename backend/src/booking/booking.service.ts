// src/booking/booking.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MechanicDiscoveryService } from '../mechanic-discovery/mechanic-discovery.service';
import { DistanceCalculationService } from '../distance-calculation/distance-calculation.service';
import { CostCalculationService } from '../cost-calculation/cost-calculation.service';
import { NotificationService } from '../notification/notification.service';
import { ServiceType, ServiceStatus } from '@prisma/client';

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

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private mechanicDiscoveryService: MechanicDiscoveryService,
    private distanceCalculationService: DistanceCalculationService,
    private costCalculationService: CostCalculationService,
    private notificationService: NotificationService,
  ) {}

  async initiateServiceRequest(data: CreateServiceRequestDto) {
    // 1. Create the service request in REQUESTED status
    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        userId: data.userId,
        serviceType: data.serviceType,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        address: data.address,
        status: ServiceStatus.REQUESTED,
        car: data.Car
          ? {
              create: data.Car.map((car) => ({
                make: car.make,
                model: car.model,
                year: car.year,
                licensePlate: car.licensePlate,
              })),
            }
          : undefined,
      },
    });

    // 2. Find nearby mechanics with the required expertise
    const nearbyMechanics =
      await this.mechanicDiscoveryService.findNearbyMechanics(
        data.latitude,
        data.longitude,
        data.serviceType,
      );

    console.log('this is nearby mechanics', JSON.stringify(nearbyMechanics));

    if (nearbyMechanics.length === 0) {
      // Update service request status to NO_MECHANICS_FOUND
      await this.prisma.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: { status: ServiceStatus.NO_MECHANICS_FOUND },
      });
      throw new NotFoundException(
        'No mechanics found in your area for this service',
      );
    }

    // 3. Calculate accurate distances and costs for each mechanic
    const mechanicOffers: MechanicOffer[] = [];

    for (const mechanic of nearbyMechanics) {
      // Get accurate distance and time using Google Maps API
      const distanceResult =
        await this.distanceCalculationService.calculateDistance(
          data.latitude,
          data.longitude,
          mechanic.address.lat,
          mechanic.address.lng,
        );

      console.log('this is ****************************', distanceResult);

      // Calculate the cost based on distance, time, and service type
      const distanceInKm =
        this.distanceCalculationService.convertMetersToKilometers(
          distanceResult.distanceInMeters,
        );

      const estimatedTimeInMinutes = distanceResult.durationInSeconds / 60;

      const cost = this.costCalculationService.calculateServiceCost(
        data.serviceType,
        distanceInKm,
        estimatedTimeInMinutes,
      );

      console.log('this is **************************** cost', cost);

      mechanicOffers.push({
        id: mechanic.id,
        name: mechanic.name,
        distance: {
          text: distanceResult.distanceText,
          value: distanceResult.distanceInMeters,
        },
        duration: {
          text: distanceResult.durationText,
          value: distanceResult.durationInSeconds,
        },
        cost,
      });
    }

    console.log(JSON.stringify(mechanicOffers));

    // 4. Create mechanic confirmations for the top 3 mechanics
    for (const offer of mechanicOffers) {
      await this.prisma.mechanicConfirmation.create({
        data: {
          mechanicId: offer.id,
          serviceRequestId: serviceRequest.id,
          status: 'PENDING',
          distanceText: offer.distance.text,
          distanceValue: offer.distance.value,
          durationText: offer.duration.text,
          durationValue: offer.duration.value,
          estimatedCost: offer.cost,
        },
      });
    }

    // // 5. Send notifications to the mechanics
    // await this.notificationService.sendServiceRequestToMechanics(
    //   serviceRequest.id,
    //   mechanicOffers.map((offer) => offer.id),
    //   data.serviceType,
    //   mechanicOffers[0].distance.text, // Use the closest mechanic's distance for simplicity
    //   mechanicOffers[0].cost, // Use the closest mechanic's cost for simplicity
    // );

    return {
      serviceRequestId: serviceRequest.id,
      mechanicOffers,
    };
  }

  async mechanicRespondsToRequest(
    mechanicId: string,
    serviceRequestId: string,
    isAccepted: boolean,
  ) {
    // Check if mechanic confirmation exists
    const confirmation = await this.prisma.mechanicConfirmation.findFirst({
      where: {
        mechanicId,
        serviceRequestId,
      },
    });

    if (!confirmation) {
      throw new NotFoundException('Mechanic confirmation not found');
    }

    // Update mechanic confirmation status
    await this.prisma.mechanicConfirmation.update({
      where: { id: confirmation.id },
      data: {
        status: isAccepted ? 'CONFIRMED' : 'REJECTED',
        respondedAt: new Date(),
      },
    });

    return { success: true };
  }

  async getMechanicsForServiceRequest(serviceRequestId: string) {
    const confirmations = await this.prisma.mechanicConfirmation.findMany({
      where: {
        serviceRequestId,
      },
      include: {
        mechanic: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            services: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // ACCEPTED comes before PENDING
        { distanceValue: 'asc' }, // Closest first
      ],
    });

    // Map and calculate average rating for each mechanic
    return confirmations.map((confirmation) => {
      const averageRating =
        confirmation.mechanic.reviews.length > 0
          ? confirmation.mechanic.reviews.reduce(
              (sum, review) => sum + review.rating,
              0,
            ) / confirmation.mechanic.reviews.length
          : null;

      return {
        mechanicId: confirmation.mechanic.id,
        name: confirmation.mechanic.name,
        mobileNumber: confirmation.mechanic.phoneNumber,
        distance: {
          text: confirmation.distanceText,
          value: confirmation.distanceValue,
        },
        duration: {
          text: confirmation.durationText,
          value: confirmation.durationValue,
        },
        estimatedCost: confirmation.estimatedCost,
        status: confirmation.status,
        averageRating,
        services: confirmation.mechanic.services,
      };
    });
  }

  async confirmBookingWithMechanic(
    userId: string,
    serviceRequestId: string,
    mechanicId: string,
  ) {
    // Check if service request exists and belongs to the user
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        id: serviceRequestId,
        userId,
      },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    // Check if mechanic has accepted the request
    const confirmation = await this.prisma.mechanicConfirmation.findFirst({
      where: {
        serviceRequestId,
        mechanicId,
        status: 'CONFIRMED',
      },
    });

    if (!confirmation) {
      throw new BadRequestException('Mechanic has not accepted this request');
    }

    // Update service request with mechanic and status
    const updatedRequest = await this.prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: {
        mechanicId,
        status: ServiceStatus.CONFIRMED,
      },
    });

    // // Send confirmation notification to the mechanic
    // await this.notificationService.sendBookingConfirmationToMechanic(
    //   mechanicId,
    //   serviceRequestId,
    //   serviceRequest.serviceType,
    // );

    // Create a chat room for communication
    const chat = await this.prisma.chat.create({
      data: {
        serviceRequest: { connect: { id: serviceRequestId } },
      },
    });

    return {
      serviceRequest: updatedRequest,
      chatId: chat.id,
    };
  }
}
