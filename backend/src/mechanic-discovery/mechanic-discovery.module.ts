// src/mechanic-discovery/mechanic-discovery.module.ts
import { Module } from '@nestjs/common';
import { MechanicDiscoveryService } from './mechanic-discovery.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MechanicDiscoveryController } from './mechanic-discovery.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MechanicDiscoveryController],
  providers: [MechanicDiscoveryService],
  exports: [MechanicDiscoveryService],
})
export class MechanicDiscoveryModule {}