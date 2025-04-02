import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceType } from '@prisma/client';

export interface MechanicWithDistance {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  services: ServiceType[];
  latitude: number;
  longitude: number;
  location: any;
  expoToken?: string;
  distance: number;
}

@Injectable()
export class MechanicDiscoveryService {
  constructor(private prisma: PrismaService) {}

  async findNearbyMechanics(
    latitude: number,
    longitude: number,
    serviceType: ServiceType,
    maxDistance: number = 10000,
    limit: number = 3,
  ): Promise<MechanicWithDistance[]> {
    const mechanics = await this.prisma.$runCommandRaw({
      aggregate: 'Mechanic',
      pipeline: [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            distanceField: 'distance',
            maxDistance: maxDistance,
            spherical: true,
            query: {
              services: serviceType,
            },
          },
        },
        { $limit: limit },
      ],
      cursor: {},
    });

    return (mechanics?.['cursor']?.['firstBatch'] ?? ([] as any[])).map(
      (m) => ({
        id: m._id.toString(),
        name: m.name,
        email: m.email,
        phoneNumber: m.phoneNumber,
        services: m.services,
        latitude: m.latitude,
        longitude: m.longitude,
        location: m.location,
        expoToken: m.expoToken,
        distance: m.distance,
      }),
    );
  }

  async saveLocationAsGeoJSON(
    mechanicId: string,
    latitude: number,
    longitude: number,
  ) {
    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: {
        latitude,
        longitude,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
    });
  }
}
