import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceType } from '@prisma/client';

export interface MechanicWithDistance {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  services: ServiceType[];
  address: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    pincode?: string;
  };
  location: any;
  expoToken?: string;
  distance: number;
}

@Injectable()
export class MechanicDiscoveryService {
  private readonly logger = new Logger(MechanicDiscoveryService.name);

  constructor(private prisma: PrismaService) {}

  async findNearbyMechanics(
    latitude: number,
    longitude: number,
    serviceType?: ServiceType,
    maxDistance: number = 10000,
    limit: number = 3,
  ): Promise<MechanicWithDistance[]> {
    this.logger.debug(`Finding mechanics near [${latitude}, ${longitude}]`);
    this.logger.debug(
      `Parameters: serviceType=${serviceType}, maxDistance=${maxDistance}m, limit=${limit}`,
    );

    // Build the query
    const query: any = {
      approved: true,
    };

    if (serviceType) {
      query.services = serviceType;
    }

    try {
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
              query: query,
            },
          },
          { $limit: limit },
        ],
        cursor: {},
      });

      const result = (
        mechanics?.['cursor']?.['firstBatch'] ?? ([] as any[])
      ).map((m) => ({
        // Fix for ObjectId conversion
        id: m._id.$oid || m._id.toString(), // Try $oid first (BSON format) or fallback to toString()
        name: m.name,
        email: m.email,
        phoneNumber: m.phoneNumber,
        services: m.services,
        address: {
          lat: m.address?.lat,
          lng: m.address?.lng,
          address: m.address?.address,
          city: m.address?.city,
          pincode: m.address?.pincode,
        },
        location: m.location,
        expoToken: m.expoToken,
        distance: m.distance,
      }));

      this.logger.debug(
        `Found ${result.length} nearby mechanics`,
        JSON.stringify(result),
      );
      return result;
    } catch (error) {
      this.logger.error('Error finding nearby mechanics', error);
      throw error;
    }
  }

  async saveLocationAsGeoJSON(
    mechanicId: string,
    latitude: number,
    longitude: number,
    address?: string,
    city?: string,
    pincode?: string,
  ) {
    this.logger.debug(
      `Saving location for mechanic ${mechanicId}: [${latitude}, ${longitude}]`,
    );

    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: {
        address: {
          lat: latitude,
          lng: longitude,
          address,
          city,
          pincode,
        },
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
    });
  }
}
