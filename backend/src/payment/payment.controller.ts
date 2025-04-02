import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async createOrder(@Body() body: { amount: number; serviceRequestId: string; comment: string }) {
    const { amount, serviceRequestId, comment } = body;
    return await this.paymentService.createOrder(amount, serviceRequestId, comment);
  }

  @Post('verify')
  async verifyPayment(
    @Body() body: { paymentId: string; orderId: string; signature: string }
  ) {
    const { paymentId, orderId, signature } = body;
    return await this.paymentService.verifyPayment(paymentId, orderId, signature);
  }
}
