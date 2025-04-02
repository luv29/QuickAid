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
  import { MechanicService } from './mechanic.service';
  import { Prisma } from '@prisma/client';
  
  @Controller('mechanics')
  export class MechanicController {
    constructor(private readonly mechanicService: MechanicService) {}
  
    @Post()
    async create(@Body() createMechanicDto: Prisma.MechanicCreateInput) {
      const mechanic = await this.mechanicService.create(createMechanicDto);
      return { success: true, mechanic };
    }
  
    @Post('sync')
    async sync(@Body() syncMechanicData: { phoneNumber: string }) {
      const mechanic = await this.mechanicService.sync(syncMechanicData.phoneNumber);
      return { success: true, mechanic };
    }
  
    @Get()
    async findMany(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('where') where?: string,
      @Query('select') select?: string,
      @Query('include') include?: string,
    ) {
      return this.mechanicService.findMany({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        where: where ? JSON.parse(where) : undefined,
        select: select ? JSON.parse(select) : undefined,
        include: include ? JSON.parse(include) : undefined,
      });
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      const mechanic = await this.mechanicService.findOne(id);
      return { success: true, mechanic };
    }
  
    @Get('with-options/:id')
    async findOneWithOption(
      @Param('id') id: string,
      @Query('include') include?: string,
      @Query('select') select?: string,
    ) {
      const mechanic = await this.mechanicService.findOneWithOptions(
        id,
        include ? JSON.parse(include) : undefined,
        select ? JSON.parse(select) : undefined,
      );
      return { success: true, mechanic };
    }
  
    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Body() updateMechanicDto: Prisma.MechanicUpdateInput,
    ) {
      const mechanic = await this.mechanicService.update(id, updateMechanicDto);
      return { success: true, mechanic };
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      const mechanic = await this.mechanicService.remove(id);
      return { success: true, mechanic };
    }
  
    @Post('auth/create-token')
    createToken(@Body('phone') phone: string) {
      console.log('creating token for ', phone);
      return this.mechanicService.createToken(phone);
    }
  
    @Post('auth/verify-token')
    verifyToken(@Body('token') token: string) {
      console.log('verifying token', token);
      return this.mechanicService.verifyToken(token);
    }
  }
  