import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

@Injectable()
export class PaymentService {
  /**
   * Creates a Stripe payment flow similar to your serverless function.
   * @param name - Customer's name.
   * @param email - Customer's email.
   * @param amount - Amount to charge (in main currency unit, e.g., dollars).
   * @returns An object containing the payment intent, ephemeral key, and customer ID.
   */
  async createOrder(name: string, email: string, amount: number) {
    if (!name || !email || !amount) {
      throw new BadRequestException('Missing required fields');
    }

    let customer;
    try {
      const customers = await stripe.customers.list({ email });
      customer =
        customers.data.length > 0
          ? customers.data[0]
          : await stripe.customers.create({ name, email });
    } catch (err) {
      console.error('Error fetching/creating customer', err);
      throw new InternalServerErrorException(
        'Error processing customer information',
      );
    }

    try {
      // Create an ephemeral key for the customer.
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2024-06-20' },
      );

      // Create a payment intent. Multiply by 100 to convert to the smallest currency unit.
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      return {
        paymentIntent,
        ephemeralKey,
        customer: customer.id,
      };
    } catch (err) {
      console.error('Error creating payment intent or ephemeral key', err);
      throw new InternalServerErrorException('Error creating payment');
    }
  }

  /**
   * Confirms a Stripe payment.
   * @param paymentMethodId - The ID of the payment method.
   * @param paymentIntentId - The ID of the payment intent.
   * @param customerId - The customer's ID.
   * @returns An object indicating success and the result of the confirmation.
   */
  async verifyPayment(
    paymentMethodId: string,
    paymentIntentId: string,
    customerId: string,
  ) {
    if (!paymentMethodId || !paymentIntentId || !customerId) {
      throw new BadRequestException('Missing required fields');
    }

    try {
      // Attach the payment method to the customer.
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId },
      );
      // Confirm the payment intent with the attached payment method.
      const result = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethod.id,
      });

      return {
        success: true,
        message: 'Payment successful',
        result,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new InternalServerErrorException('Error confirming payment');
    }
  }
}
