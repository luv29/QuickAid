import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceType } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly expo: Expo;
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendServiceRequestToMechanics(
    serviceRequestId: string,
    mechanicIds: string[],
    serviceType: ServiceType,
    distance: string,
    cost: number,
  ): Promise<void> {
    const mechanics = await this.prisma.mechanic.findMany({
      where: { id: { in: mechanicIds } },
      select: { id: true, name: true, expoToken: true },
    });

    const messages: ExpoPushMessage[] = [];

    for (const mechanic of mechanics) {
      if (!mechanic.expoToken || !Expo.isExpoPushToken(mechanic.expoToken)) {
        this.logger.warn(
          `Invalid Expo push token for mechanic: ${mechanic.id}`,
        );
        continue;
      }

      messages.push({
        to: mechanic.expoToken,
        sound: 'default',
        title: 'New Service Request',
        body: `New ${serviceType} request (${distance} away)`,
        data: {
          serviceRequestId,
          serviceType,
          distance,
          cost: cost.toFixed(2),
          type: 'SERVICE_REQUEST',
        },
        priority: 'high',
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        this.logger.error('Error sending notifications', error);
      }
    }
  }

  async sendBookingConfirmationToMechanic(
    mechanicId: string,
    serviceRequestId: string,
    serviceType: ServiceType,
  ): Promise<void> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: { expoToken: true },
    });

    if (!mechanic?.expoToken || !Expo.isExpoPushToken(mechanic.expoToken)) {
      this.logger.warn(`Invalid Expo push token for mechanic: ${mechanicId}`);
      return;
    }

    const message: ExpoPushMessage = {
      to: mechanic.expoToken,
      sound: 'default',
      title: 'Booking Confirmed',
      body: `A customer has confirmed your ${serviceType} service request`,
      data: {
        serviceRequestId,
        type: 'BOOKING_CONFIRMATION',
      },
      priority: 'high',
    };

    try {
      await this.expo.sendPushNotificationsAsync([message]);
    } catch (error) {
      this.logger.error('Error sending booking confirmation', error);
    }
  }
}
