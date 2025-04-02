import { Controller, Post, Body, Req } from '@nestjs/common';
import { SosService, SOSInput } from './sos.service';

@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post()
  async createSOS(@Body() sosInput: SOSInput, @Req() req: any) {
    const newSOS = await this.sosService.createSOS(sosInput);
    return { success: true, data: newSOS };
  }
}
