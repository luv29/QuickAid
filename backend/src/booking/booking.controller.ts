import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ServiceType } from '@prisma/client';

import { MechanicOffer } from './booking.service';

type Car = {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
};

class CreateServiceRequestDto {
  userId: string;
  serviceType: ServiceType;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  Car?: Car[];
}

class MechanicResponseDto {
  serviceRequestId: string;
  isAccepted: boolean;
  mechanicId: string;
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
    @Body() createServiceRequestDto: CreateServiceRequestDto,
  ): Promise<{ serviceRequestId: string; mechanicOffers: MechanicOffer[] }> {
    return this.bookingService.initiateServiceRequest(createServiceRequestDto);
  }

  @Post('mechanic/response')
  async mechanicRespondsToRequest(@Body() responseDto: MechanicResponseDto) {
    return this.bookingService.mechanicRespondsToRequest(
      responseDto.mechanicId,
      responseDto.serviceRequestId,
      responseDto.isAccepted,
    );
  }

  @Get('request/:id/mechanics')
  async getAvailableMechanics(@Param('id') serviceRequestId: string) {
    return this.bookingService.getMechanicsForServiceRequest(serviceRequestId);
  }

  @Post('confirm')
  async confirmBooking(@Body() confirmBookingDto: ConfirmBookingDto) {
    return this.bookingService.confirmBookingWithMechanic(
      confirmBookingDto.serviceRequestId,
      confirmBookingDto.mechanicId,
    );
  }
}
