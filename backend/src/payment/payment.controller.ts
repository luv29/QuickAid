import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async createOrder(
    @Body() body: { name: string; email: string; amount: number },
  ) {
    const { name, email, amount } = body;
    return await this.paymentService.createOrder(name, email, amount);
  }

  @Post('verify')
  async confirmPayment(
    @Body()
    body: {
      paymentMethodId: string;
      paymentIntentId: string;
      customerId: string;
    },
  ) {
    const { paymentMethodId, paymentIntentId, customerId } = body;
    return await this.paymentService.verifyPayment(
      paymentMethodId,
      paymentIntentId,
      customerId,
    );
  }
}
