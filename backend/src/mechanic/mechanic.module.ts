import { Module } from '@nestjs/common';
import { MechanicController } from './mechanic.controller';
import { MechanicService } from './mechanic.service';

@Module({
  controllers: [MechanicController],
  providers: [MechanicService]
})
export class MechanicModule {}
