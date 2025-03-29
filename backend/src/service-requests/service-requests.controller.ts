import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { Prisma } from '@prisma/client';

@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private readonly service: ServiceRequestsService) {}

  @Post()
  async create(@Body() data: Prisma.ServiceRequestCreateInput) {
    return await this.service.create(data);
  }

  @Get()
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('where') where?: string,
    @Query('select') select?: string,
    @Query('include') include?: string,
  ) {
    return this.service.findMany({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      select: select ? JSON.parse(select) : undefined,
      where: where ? JSON.parse(where) : undefined,
      include: include ? JSON.parse(include) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Query('select') select?: string,
  ) {
    return this.service.findOne(
      id,
      include ? JSON.parse(include) : undefined,
      select ? JSON.parse(select) : undefined,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.ServiceRequestUpdateInput,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
