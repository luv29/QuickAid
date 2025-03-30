import { Test, TestingModule } from '@nestjs/testing';
import { SosService } from './sos.service';

describe('SosService', () => {
  let service: SosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SosService],
    }).compile();

    service = module.get<SosService>(SosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
