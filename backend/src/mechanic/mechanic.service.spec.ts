import { Test, TestingModule } from '@nestjs/testing';
import { MechanicService } from './mechanic.service';

describe('MechanicService', () => {
  let service: MechanicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MechanicService],
    }).compile();

    service = module.get<MechanicService>(MechanicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
