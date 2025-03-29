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
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: Prisma.UserCreateInput) {
    const user = await this.usersService.create(createUserDto);
    return { success: true, user };
  }

  @Post('sync')
  async sync(@Body() syncUserData: { phoneNumber: string }) {
    const user = await this.usersService.sync(syncUserData.phoneNumber);
    return { success: true, user };
  }

  @Get()
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('where') where?: string,
    @Query('select') select?: string,
    @Query('include') include?: string,
  ) {
    return this.usersService.findMany({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      where: where ? JSON.parse(where) : undefined,
      select: select ? JSON.parse(select) : undefined,
      include: include ? JSON.parse(include) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return { success: true, user };
  }

  @Get('with-options/:id')
  async findOneWithOption(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Query('select') select?: string,
  ) {
    const user = await this.usersService.findOneWithOptions(
      id,
      include ? JSON.parse(include) : undefined,
      select ? JSON.parse(select) : undefined,
    );
    return { success: true, user };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return { success: true, user };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    return { success: true, user };
  }

  @Post('auth/create-token')
  createToken(@Body('phone') phone: string) {
    console.log('creating token for ', phone);
    return this.usersService.createToken(phone);
  }

  @Post('auth/verify-token')
  verifyToken(@Body('token') token: string) {
    console.log('verifying token', token);
    return this.usersService.verifyToken(token);
  }
}
