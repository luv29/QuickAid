import { Test, TestingModule } from '@nestjs/testing';
import { DistanceCalculationService } from './distance-calculation.service';

describe('DistanceCalculationService', () => {
  let service: DistanceCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistanceCalculationService],
    }).compile();

    service = module.get<DistanceCalculationService>(DistanceCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
