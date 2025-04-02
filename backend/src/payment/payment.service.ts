import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from 'src/database/database.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
    private razorpay: Razorpay;

    constructor(private readonly db: DatabaseService) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount: number, serviceRequestId: string, comment: string) {
        const receipt = `receipt_order_${uuidv4()}`;
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt,
            notes: {
                description: 'Payment for service',
                serviceRequestId,
            },
        };

        try {
            const order = await this.razorpay.orders.create(options);

            const payment = await this.db.payment.create({
                data: {
                    serviceRequestId,
                    amount,
                    status: PaymentStatus.PENDING,
                    razorpayOrderId: order.id,
                    razorpayPaymentId: null,
                    razorpaySignature: null,
                    comment,
                },
            });

            return {
                success: true,
                order,
                payment,
            };
        } catch (err) {
            console.error('Error creating Razorpay order', err);
            throw new Error('Error creating Razorpay order');
        }
    }

    async verifyPayment(paymentId: string, orderId: string, signature: string) {
        const generatedSignature = this.generateSignature(paymentId, orderId);

        if (generatedSignature === signature) {
            const razorpayPayment = await this.razorpay.payments.fetch(paymentId);

            let payment;
            if (razorpayPayment.status === 'captured') {
                payment = await this.db.payment.update({
                    where: { serviceRequestId: razorpayPayment.notes.serviceRequestId },
                    data: {
                        razorpayPaymentId: paymentId,
                        razorpaySignature: signature,
                        status: PaymentStatus.COMPLETED,
                    },
                });
            } else {
                payment = await this.db.payment.update({
                    where: { serviceRequestId: razorpayPayment.notes.serviceRequestId },
                    data: {
                        razorpayPaymentId: paymentId,
                        razorpaySignature: signature,
                        status: PaymentStatus.FAILED,
                    },
                });
            }

            await this.db.serviceRequest.update({
                where: { id: razorpayPayment.notes.serviceRequestId },
                data: {
                    payment: { connect: { id: payment.id } },
                },
            });

            return { success: razorpayPayment.status === 'captured', payment };
        } else {
            return { success: false, message: 'Payment verification failed (signature mismatch)' };
        }
    }



    private generateSignature(paymentId: string, orderId: string): string {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${orderId}|${paymentId}`);
        return hmac.digest('hex');
    }
}
