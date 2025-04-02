import { Module } from '@nestjs/common';
import { DistanceCalculationService } from './distance-calculation.service';

@Module({
  providers: [DistanceCalculationService],
  exports: [DistanceCalculationService],
})
export class DistanceCalculationModule {}
