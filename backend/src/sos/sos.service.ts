import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Prisma, SOSStatus } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from '../mail/mail.service';

export type SOSInput = {
    userId: string;
    latitude: number;
    longitude: number;
    customMessage?: string;
    emergencyContact: {
        id?: string;
        name: string;
        mobileNumber: string;
        email?: string;
    };
};

@Injectable()
export class SosService {
    constructor(
        private readonly db: DatabaseService,
        private readonly mailService: MailService,
    ) { }

    async createSOS(input: SOSInput) {
      const userId = input.userId;
        const { latitude, longitude, emergencyContact, customMessage } = input;

        let ecRecord;
        if (emergencyContact.id) {
            ecRecord = await this.db.emergencyContact.findUnique({
                where: { id: emergencyContact.id },
            });
            if (!ecRecord) {
                throw new NotFoundException('Emergency contact not found');
            }
        } else {
            ecRecord = await this.db.emergencyContact.create({
                data: {
                    userId,
                    name: emergencyContact.name,
                    mobileNumber: emergencyContact.mobileNumber,
                },
            });
        }

        const sosData: Prisma.SOSCreateInput = {
            user: { connect: { id: userId } },
            latitude,
            longitude,
            customMessage: customMessage ?? null,
            status: SOSStatus.ACTIVE,
            emergencyContact: { connect: { id: ecRecord.id } },
        };

        const newSOS = await this.db.sOS.create({
            data: sosData,
        });

        await this.db.user.update({
            where: { id: userId },
            data: {
                sosEvents: {
                    connect: { id: newSOS.id },
                },
            },
        });

        try {

            const userRecord = await this.db.user.findUnique({
                where: { id: userId },
                select: { name: true },
              });
            
            const username = userRecord?.name || 'User';
              

            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>SOS Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
          <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <h2 style="color: #d9534f;">Emergency Alert!</h2>
                      <p style="font-size: 16px; color: #333333;">
                        User ${username} has triggered an SOS alert.
                      </p>
                      <p style="font-size: 14px; color: #555555;">
                        ${customMessage ? customMessage : ''}
                      </p>
                      <a href="${googleMapsUrl}" target="_blank" 
                         style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #337ab7; color: #ffffff; text-decoration: none; border-radius: 4px;">
                        View Location on Map
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #eeeeee; padding: 10px; text-align: center; font-size: 12px; color: #777777;">
                      Please act immediately.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

            await this.mailService.sendMail({
                to: emergencyContact.email || ecRecord.mobileNumber,
                subject: 'SOS Alert!',
                text: `User ${userId} has triggered an SOS alert.${customMessage ? ` Message: ${customMessage}` : ''} Please check immediately. View location: ${googleMapsUrl}`,
                html: htmlTemplate,
            });

        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Failed to send notification');
        }

        return newSOS;
    }
}
