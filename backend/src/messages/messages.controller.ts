import { Controller, Get, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Get('get-otp')
  getOtp(@Query('phone') phone: string) {
    return this.messagesService.getOtp(phone);
  }

  @Get('verify-otp')
  verifyOtp(@Query('phone') phone: string, @Query('otp') otp: string) {
    return this.messagesService.verifyOtp(phone, otp);
  }
}
