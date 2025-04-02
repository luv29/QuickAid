// src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MechanicDiscoveryModule } from '../mechanic-discovery/mechanic-discovery.module';
import { DistanceCalculationModule } from '../distance-calculation/distance-calculation.module';
import { CostCalculationModule } from '../cost-calculation/cost-calculation.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    MechanicDiscoveryModule,
    DistanceCalculationModule,
    CostCalculationModule,
    NotificationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
