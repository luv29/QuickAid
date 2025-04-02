// src/cost-calculation/cost-calculation.module.ts
import { Module } from '@nestjs/common';
import { CostCalculationService } from './cost-calculation.service';

@Module({
  providers: [CostCalculationService],
  exports: [CostCalculationService],
})
export class CostCalculationModule {}
