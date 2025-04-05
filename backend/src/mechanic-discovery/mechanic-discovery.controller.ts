import { Controller, Get, Query } from '@nestjs/common';
import { MechanicDiscoveryService } from './mechanic-discovery.service';
import { ServiceType } from '@prisma/client';

@Controller('mechanic-discovery')
export class MechanicDiscoveryController {
  constructor(
    private readonly mechanicDiscoveryService: MechanicDiscoveryService,
  ) {}

  @Get('nearby')
  async findNearbyMechanics(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('serviceType') serviceType?: ServiceType,
    @Query('maxDistance') maxDistance?: string,
    @Query('limit') limit?: string,
  ) {
    const mechanics = await this.mechanicDiscoveryService.findNearbyMechanics(
      +latitude,
      +longitude,
      serviceType,
      maxDistance ? +maxDistance : undefined,
      limit ? +limit : undefined,
    );
    return { success: true, mechanics };
  }
}
