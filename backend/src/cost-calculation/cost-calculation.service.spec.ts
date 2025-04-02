import { Test, TestingModule } from '@nestjs/testing';
import { CostCalculationService } from './cost-calculation.service';

describe('CostCalculationService', () => {
  let service: CostCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostCalculationService],
    }).compile();

    service = module.get<CostCalculationService>(CostCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
