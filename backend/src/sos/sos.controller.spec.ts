import { Test, TestingModule } from '@nestjs/testing';
import { SosController } from './sos.controller';

describe('SosController', () => {
  let controller: SosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SosController],
    }).compile();

    controller = module.get<SosController>(SosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
