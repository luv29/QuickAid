// src/cost-calculation/cost-calculation.service.ts
import { Injectable } from '@nestjs/common';
import { ServiceType } from '@prisma/client';

interface CostFactors {
  basePrice: number;
  pricePerKilometer: number;
  pricePerMinute: number;
  minimumCharge: number;
}

@Injectable()
export class CostCalculationService {
  private readonly serviceTypeCosts: Record<ServiceType, CostFactors> = {
    TIRE_CHANGE: {
      basePrice: 20,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.5,
      minimumCharge: 35,
    },
    BATTERY_JUMP: {
      basePrice: 15,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.5,
      minimumCharge: 30,
    },
    TOW: {
      basePrice: 50,
      pricePerKilometer: 2.5,
      pricePerMinute: 0.7,
      minimumCharge: 70,
    },
    FUEL_DELIVERY: {
      basePrice: 25,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.5,
      minimumCharge: 40,
    },
    LOCKOUT: {
      basePrice: 30,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.6,
      minimumCharge: 45,
    },
    JUMP_START: {
      basePrice: 30,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.6,
      minimumCharge: 45,
    },
    ELECTRIC_CHARGING: {
      basePrice: 30,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.6,
      minimumCharge: 45,
    },
    CAR_REPAIR: {
      basePrice: 30,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.6,
      minimumCharge: 45,
    },
    CUSTOM_SERVICE: {
      basePrice: 30,
      pricePerKilometer: 1.5,
      pricePerMinute: 0.6,
      minimumCharge: 45,
    },
  };

  calculateServiceCost(
    serviceType: ServiceType,
    distanceInKilometers: number,
    estimatedTimeInMinutes: number,
  ): number {
    const costFactors = this.serviceTypeCosts[serviceType];
    if (!costFactors) {
      throw new Error(`Unknown service type: ${serviceType}`);
    }

    // Calculate the cost based on distance, time, and base price
    const distanceCost = distanceInKilometers * costFactors.pricePerKilometer;
    const timeCost = estimatedTimeInMinutes * costFactors.pricePerMinute;
    const totalCost = costFactors.basePrice + distanceCost + timeCost;

    // Apply minimum charge if calculated cost is lower
    return Math.max(totalCost, costFactors.minimumCharge);
  }

  // Calculate estimated time based on distance (if Google API didn't provide it)
  estimateTimeFromDistance(distanceInKilometers: number): number {
    // Assuming average speed of 40 km/h for urban areas
    const averageSpeedKmh = 40;
    // Convert to minutes
    return Math.ceil((distanceInKilometers / averageSpeedKmh) * 60);
  }
}
