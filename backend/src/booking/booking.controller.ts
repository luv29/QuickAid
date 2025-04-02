import { Controller, Post, Body, Get, Param, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ServiceType } from '@prisma/client';

import { MechanicOffer } from './booking.service';

class CreateServiceRequestDto {
  userId: string;
  serviceType: ServiceType;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
}

class MechanicResponseDto {
  serviceRequestId: string;
  isAccepted: boolean;
}

class ConfirmBookingDto {
  serviceRequestId: string;
  mechanicId: string;
}

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('request')
  async createServiceRequest(
    @Request() req,
    @Body() createServiceRequestDto: CreateServiceRequestDto,
  ): Promise<{ serviceRequestId: string; mechanicOffers: MechanicOffer[] }> {
    return this.bookingService.initiateServiceRequest(createServiceRequestDto);
  }

  @Post('mechanic/response')
  async mechanicRespondsToRequest(
    @Request() req,
    @Body() responseDto: MechanicResponseDto,
  ) {
    return this.bookingService.mechanicRespondsToRequest(
      req.user.id, // Mechanic ID from JWT
      responseDto.serviceRequestId,
      responseDto.isAccepted,
    );
  }

  @Get('request/:id/mechanics')
  async getAvailableMechanics(@Param('id') serviceRequestId: string) {
    return this.bookingService.getMechanicsForServiceRequest(serviceRequestId);
  }

  @Post('confirm')
  async confirmBooking(
    @Request() req,
    @Body() confirmBookingDto: ConfirmBookingDto,
  ) {
    return this.bookingService.confirmBookingWithMechanic(
      req.user.id, // User ID from JWT
      confirmBookingDto.serviceRequestId,
      confirmBookingDto.mechanicId,
    );
  }
}
