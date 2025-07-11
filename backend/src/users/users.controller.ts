import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  async create(@Body() data: Prisma.UserCreateInput) {
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
      where: where ? JSON.parse(where) : undefined,
      select: select ? JSON.parse(select) : undefined,
      include: include ? JSON.parse(include) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Query('select') select?: string,
  ) {
    return await this.service.findOne(
      id,
      include ? JSON.parse(include) : undefined,
      select ? JSON.parse(select) : undefined,
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
    return await this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }
}
